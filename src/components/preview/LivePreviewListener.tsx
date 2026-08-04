'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/**
 * Refreshes the preview as the editor types.
 *
 * Payload's live-preview pane posts the current form state to the iframe; this
 * listens for those messages and re-renders the route, so a content manager sees
 * their changes without saving first.
 *
 * Mounted only when draft mode is on, so nothing is shipped to public visitors.
 */
export const LivePreviewListener = () => {
  const router = useRouter()

  return (
    <RefreshRouteOnSave
      // Must match the admin panel's origin or the browser drops the message.
      serverURL={process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}
      refresh={() => router.refresh()}
    />
  )
}
