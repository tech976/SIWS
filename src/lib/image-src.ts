/**
 * Normalises a Payload media URL for `next/image`.
 *
 * Payload returns an absolute URL built from `serverURL`, e.g.
 * `http://localhost:3000/api/media/file/photo.jpg`. `next/image` treats any
 * absolute URL as remote and refuses to load it unless the hostname appears in
 * `images.remotePatterns` — which fails with:
 *
 *   Invalid src prop (...) on `next/image`, hostname "localhost" is not
 *   configured under images in your `next.config.js`
 *
 * Whitelisting the hostname would be the wrong fix: it changes between local,
 * staging and production, and every deployment would need the config updated in
 * step or silently lose all its images. Reducing a same-origin URL to a path
 * instead lets the optimiser treat it as a local file in every environment, with
 * no configuration at all.
 *
 * A genuinely external host — an S3 bucket or CDN, once SIWS's hosting is
 * arranged — is passed through untouched, and *that* is the case where
 * `remotePatterns` is the correct answer.
 */

const siteOrigin = (): string | null => {
  const configured = process.env.NEXT_PUBLIC_SERVER_URL
  if (!configured) return null
  try {
    return new URL(configured).origin
  } catch {
    return null
  }
}

export const toImageSrc = (url: string): string => {
  // Already a path — nothing to do.
  if (url.startsWith('/')) return url

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return url
  }

  const origin = siteOrigin()

  /**
   * Matched on origin where one is configured. Where it is not, any
   * `localhost`/`127.0.0.1` URL is still treated as our own, because that is
   * only reachable in development and the alternative is a broken image.
   */
  const isOwnOrigin =
    (origin !== null && parsed.origin === origin) ||
    parsed.hostname === 'localhost' ||
    parsed.hostname === '127.0.0.1'

  if (!isOwnOrigin) return url

  return `${parsed.pathname}${parsed.search}`
}
