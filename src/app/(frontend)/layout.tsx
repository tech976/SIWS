import type { Metadata, Viewport } from 'next'
import { draftMode } from 'next/headers'
import type { ReactNode } from 'react'

import { LivePreviewListener } from '@/components/preview/LivePreviewListener'
import { PreviewBanner } from '@/components/preview/PreviewBanner'
import { fontVariables } from '@/fonts'

import './globals.css'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/**
 * BR-SEO-08 — "The staging site shall be excluded from search-engine indexing,
 * and go-live shall include an explicit step to enable indexing on the
 * production site."
 *
 * Indexing is therefore opt-in: a deployment must set the flag deliberately.
 * A missing or malformed value keeps the site out of the index, so the failure
 * mode is a staging site that stays private rather than one that leaks.
 */
const indexingEnabled = process.env.NEXT_PUBLIC_ENABLE_INDEXING === 'true'

export const metadata: Metadata = {
  metadataBase: new URL(serverURL),
  title: {
    default: "South Indians' Welfare Society (SIWS)",
    template: "%s · South Indians' Welfare Society",
  },
  description:
    "South Indians' Welfare Society — a trusted Mumbai educational institution since 1934, with Kindergarten, Primary, Secondary and Junior College units.",
  robots: indexingEnabled
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
  openGraph: {
    type: 'website',
    siteName: "South Indians' Welfare Society (SIWS)",
    locale: 'en_IN',
  },
  // FR-SOC-07 — shared links render correctly on social platforms.
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Deliberately NOT capping maximum-scale: preventing pinch-zoom fails
  // WCAG 2.1 SC 1.4.4 (Resize Text).
  themeColor: '#613e97',
}

const FrontendLayout = async ({ children }: { children: ReactNode }) => {
  // BR-EDIT-04 — the preview chrome exists only while draft mode is on, so a
  // public visitor is never served either component.
  const { isEnabled: isDraft } = await draftMode()

  return (
    <html lang="en-IN" className={fontVariables} suppressHydrationWarning>
      <body>
        {/* SRS 4.4 — skip-to-content link, the first thing a keyboard user reaches. */}
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>

        {isDraft ? (
          <>
            <PreviewBanner />
            <LivePreviewListener />
          </>
        ) : null}

        {children}
      </body>
    </html>
  )
}

export default FrontendLayout
