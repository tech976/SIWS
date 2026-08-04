import type { Page, Unit } from '@/payload-types'

import { UNIT_HOME_SLUG } from './site'

/**
 * Builds the public path for a page, for the preview routes.
 *
 * Kept separate from `lib/href.ts` because this runs against a document that may
 * only be *partially* populated — the admin panel hands the live-preview URL
 * builder the current form state, where `unit` is usually a bare ID rather than
 * the unit document. The earlier version returned null in that case, the preview
 * URL fell back to `/`, and the pane showed a 404.
 *
 * `unitSlug` is therefore resolved by the caller (which can look it up) and
 * passed in, rather than being dug out of a relationship that may not be there.
 */
export const buildPagePath = (
  page: Pick<Page, 'slug'> & Partial<Pick<Page, 'unit'>>,
  unitSlug: string | null,
): string | null => {
  const slug = typeof page.slug === 'string' ? page.slug.trim() : ''
  if (slug.length === 0) return null

  // A unit's landing page lives at `/{unit}`, not `/{unit}/home`.
  if (unitSlug && slug === UNIT_HOME_SLUG) return `/${unitSlug}`

  if (unitSlug) return `/${unitSlug}/${slug}`

  // No unit: an institution-wide page on the main portal.
  return `/${slug}`
}

/** Pulls the slug off a `unit` relationship that may or may not be populated. */
export const unitSlugFrom = (unit: Page['unit']): string | null => {
  if (unit && typeof unit === 'object' && typeof (unit as Unit).slug === 'string') {
    return (unit as Unit).slug
  }
  return null
}

/**
 * Guards the redirect target.
 *
 * The preview route redirects to a path taken from a query string, so it must
 * be confirmed to be a same-site path. Without this, `?path=https://evil.example`
 * would turn the route into an open redirect — and one that a signed-in member
 * of staff would be the most likely person to follow.
 */
export const isSafeInternalPath = (path: string): boolean => {
  if (typeof path !== 'string' || path.length === 0) return false
  if (!path.startsWith('/')) return false
  // `//host` and `/\host` are protocol-relative and would leave the site.
  if (path.startsWith('//') || path.startsWith('/\\')) return false
  return true
}
