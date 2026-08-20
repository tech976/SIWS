import { draftMode } from 'next/headers'
import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { type NextRequest, NextResponse } from 'next/server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { buildPagePath, isSafeInternalPath, unitSlugFrom } from '@/lib/preview-path'
import type { Page, Post } from '@/payload-types'

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

  /*
   * Posts preview through the same gate as pages. A department write-up is
   * unpublished content like any other, and the trustees asked specifically
   * that an HOD "be able to preview the page, make any necessary changes, and
   * then click the Publish button" — so it needs draft mode, and it needs the
   * same three checks below rather than a shortcut of its own.
   */
  const PREVIEWABLE = ['pages', 'posts'] as const
  type Previewable = (typeof PREVIEWABLE)[number]

  if (!id || !PREVIEWABLE.includes(collection as Previewable)) {
    return new NextResponse('Missing or unsupported preview parameters.', { status: 400 })
  }
  const target = collection as Previewable

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
  let doc: Page | Post | null = null
  try {
    doc = (await payload.findByID({
      collection: target,
      id,
      depth: 1,
      draft: true,
      overrideAccess: false,
      user,
    })) as Page | Post
  } catch {
    return new NextResponse('You do not have permission to preview this page.', { status: 403 })
  }

  if (!doc) {
    return new NextResponse('That page could not be found.', { status: 404 })
  }

  /*
   * A post's slug is generated from its title, so on a document saved before a
   * title was typed it is still absent. `buildPagePath` already returns null
   * for an empty slug, which produces the "no web address yet" message below —
   * the coalesce is only here because Post types it as optional and Page does
   * not.
   */
  const path = buildPagePath(
    { slug: doc.slug ?? '', unit: doc.unit },
    unitSlugFrom(doc.unit ?? null),
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
