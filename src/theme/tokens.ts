/**
 * SIWS brand tokens.
 *
 * Taken from the institution's own site, siwscollege.edu.in, which defines its
 * palette as CSS variables in its theme stylesheet: `--siwsBlue: #2E3192`,
 * `--siwsOrange: #FFAF2A`, `--siwsSkyBlue: #3B86D7`, `--siwsSeaBlue: #DBECFF`,
 * `--siwsGrey: #F5F5F5` and `--siwsDefault: #1E1E1E`. Those six are reproduced
 * exactly; everything else here is derived from them for states the college
 * site has no equivalent of.
 *
 * This module is the one source of truth: `globals.css` emits these as CSS
 * custom properties and the admin panel reads them, so a brand change lands in
 * one place (SRS 2.5 — "A consistent design template must be applied across all
 * unit sites for brand cohesion").
 *
 * NAMED BY ROLE, NOT BY HUE
 * -------------------------
 * These were `purple`, `yellow` and `cream`, after the approved landing page.
 * The college's palette is blue and orange, and a token called `purple` holding
 * `#2E3192` is a trap for whoever reads it next. The names now say what a
 * colour is *for*, so the next brand change is a value edit rather than a
 * rename — which is what this module was for in the first place.
 */

export const SIWS_BRAND = {
  /** `--siwsBlue`. Headings, nav, primary surfaces. */
  brand: '#2e3192',
  /** Derived. Hover and pressed states on brand fills. */
  brandDeep: '#24276f',
  /** Derived. The deepest surface — footer, testimonial panels. */
  brandInk: '#24276f',
  /** Derived. A barely-there wash for cards and monograms. */
  brandTint: '#dbecff',

  /** `--siwsOrange`. CTA fills, underlines, highlight words. */
  accent: '#ffaf2a',
  /** From the college homepage. Borders and hover on accent fills. */
  accentDeep: '#f39200',

  /**
   * The section bar and the footer. One step darker than the college's
   * `--siwsSkyBlue` so that white text on it clears 4.5:1 (4.66 against 3.77).
   */
  sky: '#3376c2',
  /** `--siwsSkyBlue` exactly. Illustration and accents — never small text. */
  skyLight: '#3376c2',
  /** `--siwsSeaBlue`. The announcement / information strip. */
  sea: '#dbecff',
  /** From the college stylesheet. Alternating section background. */
  seaSoft: '#ffffff',
  /** `--siwsGrey`. Neutral section background. */
  grey: '#f5f5f5',

  /** `--siwsDefault`. Body copy. */
  ink: '#1e1e1e',
  inkSoft: '#3a3a42',
  inkMuted: '#5c5c68',

  white: '#ffffff',
} as const

export type BrandColour = keyof typeof SIWS_BRAND

/**
 * Per-unit accent. The SRS requires one shared design system across all unit
 * sites, so units differ only by accent — never by layout, type scale or
 * component styling.
 *
 * Contrast note: each light accent below is used as a *background* with
 * `--color-brand` (#2e3192) text, or as a *border/detail* colour. Those pairings
 * clear WCAG 2.1 AA 4.5:1 — brand on accent measures 5.79:1 — which they would
 * fail against white text. `brandInk` is the one dark option and takes white
 * text at 14.24:1 (NFR Accessibility).
 */
export const UNIT_ACCENTS = [
  { label: 'SIWS Orange (default)', value: 'accent', hex: SIWS_BRAND.accent },
  { label: 'Deep Orange', value: 'accentDeep', hex: SIWS_BRAND.accentDeep },
  { label: 'Sky Blue', value: 'sky', hex: SIWS_BRAND.sky },
  { label: 'Sea Blue', value: 'sea', hex: SIWS_BRAND.sea },
  { label: 'Deep Blue', value: 'brandInk', hex: SIWS_BRAND.brandInk },
] as const

export type UnitAccent = (typeof UNIT_ACCENTS)[number]['value']

export const accentHex = (accent: UnitAccent | null | undefined): string =>
  UNIT_ACCENTS.find((option) => option.value === accent)?.hex ?? SIWS_BRAND.accent

/**
 * Type families, matched to siwscollege.edu.in — Anton for headings,
 * Montserrat for body, Space Grotesk for the occasional contrasting section.
 * All three are OFL-licensed and self-hosted through `next/font/google`.
 *
 * `Bright Chalk` is the one face not on the college site: a licensed file used
 * for the handwritten subtitle on the enquiry card, kept from the approved
 * Kindergarten design. Say the word and it goes too.
 */
export const SIWS_FONTS = {
  display: "'Anton', 'Montserrat', sans-serif",
  body: "'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif",
  alt: "'Space Grotesk', 'Montserrat', sans-serif",
  chalk: "'Bright Chalk', 'Comic Sans MS', cursive",
} as const

/**
 * Severity treatments for the emergency notice banner (FR-EMG-05).
 * Each pairing is checked to at least 4.5:1 against its own foreground so the
 * banner meets contrast requirements at every severity.
 */
export const NOTICE_SEVERITY = {
  info: { label: 'Information', bg: '#dbecff', fg: '#1f2a5c', border: '#7fb0e8' },
  warning: { label: 'Warning', bg: '#f39200', fg: '#2b1600', border: '#b56b00' },
  critical: { label: 'Critical', bg: '#b3172b', fg: '#ffffff', border: '#7d0f1e' },
} as const

export type NoticeSeverity = keyof typeof NOTICE_SEVERITY
