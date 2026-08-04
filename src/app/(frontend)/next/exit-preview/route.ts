import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * Leaves draft mode.
 *
 * Draft mode persists as a cookie for the whole browsing session, so without a
 * way out a member of staff who previewed one page would keep seeing unpublished
 * content everywhere afterwards — and could easily mistake a draft for the live
 * site. The banner rendered in the frontend layout links here.
 */
export const GET = async (): Promise<Response> => {
  const draft = await draftMode()
  draft.disable()

  return NextResponse.redirect(
    new URL('/', process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  )
}
