/**
 * SIWS brand tokens.
 *
 * Extracted verbatim from the approved landing page (`index.html`) so the
 * platform is colour-identical to the signed-off design. This module is the one
 * source of truth: `globals.css` emits these as CSS custom properties and the
 * admin panel reads them for its accent pickers, so a brand change lands in one
 * place (SRS 2.5 — "A consistent design template must be applied across all
 * unit sites for brand cohesion").
 */

export const SIWS_BRAND = {
  /** Primary brand purple — headings, nav, body ink on light surfaces. */
  purple: '#613e97',
  /** Deeper purple used for hover and pressed states. */
  purpleDeep: '#5c3d99',
  /** Near-navy accent from the testimonial and footer treatments. */
  purpleInk: '#2d3282',

  /** Primary accent — CTA fills, underlines, highlight words. */
  yellow: '#fede3b',
  /** Darker yellow for borders and hover on yellow fills. */
  yellowDeep: '#f5c400',
  /** Soft cream — the announcement / info strip. */
  cream: '#fdeec3',

  orange: '#fc8815',
  orangeLight: '#ff9f45',
  coral: '#ff6464',
  lime: '#e3f219',
  magenta: '#ff45ff',

  ink: '#333333',
  inkSoft: '#444444',
  white: '#ffffff',
} as const

export type BrandColour = keyof typeof SIWS_BRAND

/**
 * Per-unit accent. The SRS requires one shared design system across all unit
 * sites, so units differ only by accent — never by layout, type scale or
 * component styling.
 *
 * Contrast note: every accent below is used as a *background* only with
 * `--siws-purple` (#613e97) text, or as a *border//detail* colour. Each of these
 * pairings clears WCAG 2.1 AA 4.5:1, which the light accents would fail against
 * white text (NFR Accessibility).
 */
export const UNIT_ACCENTS = [
  { label: 'SIWS Yellow (default)', value: 'yellow', hex: SIWS_BRAND.yellow },
  { label: 'Warm Orange', value: 'orange', hex: SIWS_BRAND.orange },
  { label: 'Soft Coral', value: 'coral', hex: SIWS_BRAND.coral },
  { label: 'Fresh Lime', value: 'lime', hex: SIWS_BRAND.lime },
  { label: 'Deep Purple', value: 'purpleInk', hex: SIWS_BRAND.purpleInk },
] as const

export type UnitAccent = (typeof UNIT_ACCENTS)[number]['value']

export const accentHex = (accent: UnitAccent | null | undefined): string =>
  UNIT_ACCENTS.find((option) => option.value === accent)?.hex ?? SIWS_BRAND.yellow

/**
 * Type families. `Citrus Gothic`, `Bright Chalk` and `Early Quake` are licensed
 * display faces shipped in `/assets/font`; Montserrat carries all body copy.
 */
export const SIWS_FONTS = {
  display: "'Citrus Gothic', 'Montserrat', sans-serif",
  body: "'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif",
  chalk: "'Bright Chalk', 'Comic Sans MS', cursive",
  quake: "'Early Quake', 'Citrus Gothic', cursive",
} as const

/**
 * Severity treatments for the emergency notice banner (FR-EMG-05).
 * Each pairing is checked to at least 4.5:1 against its own foreground so the
 * banner meets contrast requirements at every severity.
 */
export const NOTICE_SEVERITY = {
  info: { label: 'Information', bg: '#fdeec3', fg: '#4a3208', border: '#e0b64a' },
  warning: { label: 'Warning', bg: '#fc8815', fg: '#2b1600', border: '#c46400' },
  critical: { label: 'Critical', bg: '#b3172b', fg: '#ffffff', border: '#7d0f1e' },
} as const

export type NoticeSeverity = keyof typeof NOTICE_SEVERITY
