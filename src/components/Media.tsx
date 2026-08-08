import Image from 'next/image'

import { toImageSrc } from '@/lib/image-src'
import type { Media as MediaDoc } from '@/payload-types'

/**
 * Renders an image from the media library.
 *
 * Uses `next/image` so the browser is served an appropriately-sized,
 * modern-format derivative rather than the original upload (NFR Performance —
 * "assets compressed and lazy-loaded where appropriate").
 */

interface MediaProps {
  resource: MediaDoc | number | string | null | undefined
  /** Passed to `sizes`. Describe the rendered width, not the file width. */
  sizes?: string
  className?: string
  /** Set for the single largest image above the fold; leave false elsewhere. */
  priority?: boolean
  /** Crop to fill the container rather than preserving intrinsic ratio. */
  fill?: boolean
  /**
   * Overrides the alt text held in the media library.
   *
   * Narrow by design. The library normally owns alt text, because the person
   * who uploads a photograph is the one who knows what is in it. The exception
   * is an image whose accessible name is fixed by its surroundings rather than
   * its content — an organisation's logo in a strip that already names the
   * organisation. There the page is the authority, and letting the library win
   * risks announcing "logo" six times in a row.
   */
  alt?: string
}

const isPopulated = (value: MediaProps['resource']): value is MediaDoc =>
  typeof value === 'object' && value !== null

export const Media = ({
  resource,
  sizes = '100vw',
  className,
  priority = false,
  fill = false,
  alt: altOverride,
}: MediaProps) => {
  // An unpopulated relationship means the file was deleted or is not readable;
  // rendering nothing is preferable to a broken image icon.
  if (!isPopulated(resource) || typeof resource.url !== 'string') return null

  /**
   * FR-SW-05 — a photograph withdrawn at a parent's request must disappear from
   * public display at once.
   *
   * Checked here as well as in the publish guard, because the guard only fires
   * when a page is saved: without this, withdrawing an image would leave it on
   * every already-published page until someone happened to re-save each one.
   */
  if (resource.withdrawn?.isWithdrawn === true) return null

  /**
   * A single hyphen is the agreed convention for "decorative" in the media
   * library. An empty `alt` removes the image from the accessibility tree,
   * which is the correct treatment — announcing a decorative image is noise
   * (WCAG 2.1 SC 1.1.1).
   */
  const rawAlt =
    typeof altOverride === 'string'
      ? altOverride.trim()
      : typeof resource.alt === 'string'
        ? resource.alt.trim()
        : ''
  const alt = rawAlt === '-' ? '' : rawAlt

  const src = toImageSrc(resource.url)

  if (fill) {
    return (
      <Image src={src} alt={alt} fill sizes={sizes} className={className} priority={priority} />
    )
  }

  // Payload records intrinsic dimensions on upload; the fallback keeps the
  // component usable for a record written before that field existed.
  const width = typeof resource.width === 'number' && resource.width > 0 ? resource.width : 1600
  const height = typeof resource.height === 'number' && resource.height > 0 ? resource.height : 900

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
      // Everything below the fold defers; the caller opts a hero image in.
      loading={priority ? 'eager' : 'lazy'}
    />
  )
}
