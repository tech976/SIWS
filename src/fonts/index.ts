import { Montserrat } from 'next/font/google'
import localFont from 'next/font/local'

/**
 * SIWS type system.
 *
 * The two display faces are licensed files shipped with the project, subset to
 * Latin + the punctuation SIWS copy actually uses and re-encoded as woff2
 * (1.29 MB → 163 KB and 1.09 MB → 184 KB). Montserrat comes through
 * `next/font/google`, which downloads it at build time and self-hosts the
 * result — so no request ever leaves the visitor's browser for a font, which
 * both helps the 3-second budget and avoids a third-party call before consent
 * (SRS 2.5, 5.25).
 */

/** Body copy across the entire site. */
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-body',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
})

/** Headings and display copy — the SIWS signature face. */
export const citrusGothic = localFont({
  src: './CitrusGothic-Regular.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-display',
  // Used in the H1 above the fold, so it is worth the early request.
  preload: true,
  fallback: ['Montserrat', 'system-ui', 'sans-serif'],
})

/** Handwritten accent — subtitles and playful asides only. */
export const brightChalk = localFont({
  src: './BrightChalk.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-chalk',
  // Decorative and never above the fold; loading it eagerly would compete with
  // the display face for bandwidth during first paint.
  preload: false,
  fallback: ['Comic Sans MS', 'cursive'],
})

/** Applied together on <html>. */
export const fontVariables = [
  montserrat.variable,
  citrusGothic.variable,
  brightChalk.variable,
].join(' ')
