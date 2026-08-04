import { draftMode } from 'next/headers'
import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { type NextRequest, NextResponse } from 'next/server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { buildPagePath, isSafeInternalPath, unitSlugFrom } from '@/lib/preview-path'
import type { Page } from '@/payload-types'

/**
 * BR-EDIT-04 — "Content managers shall preview changes before publishing."
 *
 * Next only serves unpublished content when *draft mode* is enabled, which is a
 * signed cookie it sets — a `?draft=true` query string does nothing on its own.
 * That was the bug behind the 404 in the preview pane: the URL asked for a
 * draft, the route had no draft-mode cookie, so it queried published content
 * only and correctly found nothing.
 *
 * This route is the missing step. It authenticates the caller as a real member
 * of staff, enables draft mode, and redirects to the page.
 *
 * SECURITY — draft mode makes unpublished content readable for the whole
 * browsing session, so this endpoint is the gate on everything the approval
 * workflow is meant to hold back. Three checks, all required:
 *
 *   1. A shared secret, so the endpoint cannot be triggered by a stray link.
 *   2. A valid Payload session — an anonymous visitor gets nothing, even with
 *      the secret.
 *   3. Per-document access, evaluated as that user. A Kindergarten content
 *      manager cannot preview a Secondary School draft by editing the URL,
 *      because `overrideAccess: false` applies their own unit scope.
 */
export const GET = async (req: NextRequest): Promise<Response> => {
  const { searchParams } = new URL(req.url)

  const collection = searchParams.get('collection')
  const id = searchParams.get('id')
  const secret = searchParams.get('previewSecret')

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return new NextResponse('Invalid preview request.', { status: 401 })
  }

  if (collection !== 'pages' || !id) {
    return new NextResponse('Missing or unsupported preview parameters.', { status: 400 })
  }

  let payload: Awaited<ReturnType<typeof getPayload>>
  try {
    payload = await getPayload({ config })
  } catch {
    return new NextResponse('Preview is unavailable.', { status: 500 })
  }

  const { user } = await payload.auth({ headers: await nextHeaders() })

  if (!user) {
    return new NextResponse('You must be signed in to preview a page.', { status: 403 })
  }

  /**
   * Loaded at depth 1 so `unit` comes back populated — that is what makes the
   * correct `/kindergarten/...` path derivable. `overrideAccess: false` applies
   * this user's own unit scope, so a Kindergarten content manager cannot preview
   * a Secondary School draft by changing the ID in the URL.
   */
  // Typed to `Page` explicitly: `findByID`'s return is a union across every
  // collection, so the narrowing has to be stated even though `collection` is
  // already checked to be 'pages' above.
  let page: Page | null = null
  try {
    page = (await payload.findByID({
      collection: 'pages',
      id,
      depth: 1,
      draft: true,
      overrideAccess: false,
      user,
    })) as Page
  } catch {
    return new NextResponse('You do not have permission to preview this page.', { status: 403 })
  }

  if (!page) {
    return new NextResponse('That page could not be found.', { status: 404 })
  }

  const path = buildPagePath(
    { slug: page.slug, unit: page.unit },
    unitSlugFrom(page.unit ?? null),
  )

  // Derived rather than taken from the query string, so it cannot be an open
  // redirect; the guard is a belt-and-braces check on our own construction.
  if (!path || !isSafeInternalPath(path)) {
    return new NextResponse(
      'This page has no web address yet. Give it a title and save, then try again.',
      { status: 400 },
    )
  }

  const draft = await draftMode()
  draft.enable()

  redirect(path)
}
