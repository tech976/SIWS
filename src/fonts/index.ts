import { Anton, Montserrat, Space_Grotesk } from 'next/font/google'
import localFont from 'next/font/local'

/**
 * SIWS type system — matched to the institution's own site.
 *
 * siwscollege.edu.in declares its faces as CSS variables in its theme:
 *
 *   --montserrat:   'Montserrat', sans-serif   → body, and `body { font-size: 17px }`
 *   --anton:        'Anton', sans-serif        → h1 and .st-heading
 *   --spaceGrotesk: 'Space Grotesk', sans-serif → the Student Corner section
 *
 * All three are reproduced here. Montserrat was already the body face, so only
 * the display face changed: Citrus Gothic out, Anton in.
 *
 * Every one comes through `next/font/google`, which downloads at build time and
 * self-hosts the result — so no request leaves the visitor's browser for a
 * font. That both helps the 3-second budget and avoids a third-party call
 * before consent (SRS 2.5, 5.25). All three are OFL-licensed, so self-hosting
 * is permitted; the previous display face was a licensed file shipped with the
 * project, and dropping it removes that licence from the dependency list.
 */

/** Body copy across the entire site. */
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-body',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
})

/**
 * Headings — the college's `--anton`.
 *
 * Anton ships a single weight (400) and is already very heavy, so nothing
 * should apply `font-bold` on top: the browser would synthesise a fake bold and
 * smear the letterforms. It is also tightly spaced and set in caps on their
 * site, which is why headings using it get a little letter-spacing back.
 */
export const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-display',
  // Used in the H1 above the fold, so it is worth the early request.
  preload: true,
  fallback: ['Montserrat', 'system-ui', 'sans-serif'],
})

/** The college's `--spaceGrotesk`, for the occasional contrasting section. */
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-alt',
  preload: false,
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
  anton.variable,
  spaceGrotesk.variable,
  brightChalk.variable,
].join(' ')
