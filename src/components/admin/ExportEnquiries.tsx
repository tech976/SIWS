'use client'

import { useState } from 'react'

/**
 * The "Download as CSV" control above the enquiries list (FR-ADM-04).
 *
 * Downloads via `fetch` rather than a bare `<a href>` so that a permission or
 * auth failure surfaces as a readable message where the person is looking —
 * a plain link would navigate to a JSON error body, which reads as a crash.
 */
export const ExportEnquiriesButton = () => {
  const [state, setState] = useState<'idle' | 'working' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const run = async () => {
    setState('working')
    setMessage('')

    try {
      const response = await fetch('/api/enquiries/export', { credentials: 'include' })

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null
        setState('error')
        setMessage(body?.error ?? 'The export could not be prepared. Please try again.')
        return
      }

      const blob = await response.blob()
      const disposition = response.headers.get('Content-Disposition') ?? ''
      const filename =
        /filename="([^"]+)"/.exec(disposition)?.[1] ?? 'siws-admission-enquiries.csv'

      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)

      setState('idle')
    } catch {
      setState('error')
      setMessage('The export could not be prepared. Check your connection and try again.')
    }
  }

  return (
    <div className="siws-export">
      <button
        type="button"
        className="btn btn--style-secondary btn--size-small siws-export__button"
        onClick={run}
        disabled={state === 'working'}
      >
        {state === 'working' ? 'Preparing…' : 'Download as CSV'}
      </button>
      <span className="siws-export__note">
        Downloads contain families’ personal details — every download is recorded.
      </span>
      {state === 'error' ? (
        <span role="alert" className="siws-export__error">
          {message}
        </span>
      ) : null}
    </div>
  )
}

export default ExportEnquiriesButton
