import type { Page, Unit } from '@/payload-types'

/**
 * URL construction for CMS content.
 *
 * Every public URL in the platform is built here, so the routing contract lives
 * in one place: `/{unit}/{page}` for unit content and `/{page}` for
 * institution-wide content on the main portal.
 */

type MaybePopulated<T> = T | number | string | null | undefined

const isPopulated = <T extends object>(value: MaybePopulated<T>): value is T =>
  typeof value === 'object' && value !== null

export const unitHref = (unit: MaybePopulated<Unit>): string | null => {
  if (!isPopulated(unit)) return null
  return typeof unit.slug === 'string' && unit.slug.length > 0 ? `/${unit.slug}` : null
}

/**
 * Resolves a page to its public path.
 *
 * Returns null when the target cannot be resolved — which happens by design
 * rather than by accident. Payload populates relationships through the same
 * access rules as the request, so a page that has been unpublished or deleted
 * comes back as a bare ID (or null) for an anonymous visitor rather than a
 * readable document. FR-QL-06 requires exactly that case to render as
 * non-broken, so callers treat null as "do not render a link".
 */
export const pageHref = (page: MaybePopulated<Page>): string | null => {
  if (!isPopulated(page)) return null
  if (typeof page.slug !== 'string' || page.slug.length === 0) return null

  const unit = page.unit
  if (isPopulated(unit) && typeof unit.slug === 'string' && unit.slug.length > 0) {
    return `/${unit.slug}/${page.slug}`
  }

  // A page whose `unit` is an unpopulated ID cannot be addressed correctly —
  // guessing the institution-wide path would produce a 404. The caller falls
  // back to plain text instead.
  if (unit === null || unit === undefined) return `/${page.slug}`

  return null
}

/** True when a URL points somewhere other than this site (FR-QL-03). */
export const isExternalHref = (href: string): boolean => {
  if (href.startsWith('/') || href.startsWith('#')) return false
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return true

  try {
    const target = new URL(href)
    const site = new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000')
    return target.host !== site.host
  } catch {
    return false
  }
}
