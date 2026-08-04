import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'
import type { GalleryBlock, Media as MediaDoc } from '@/payload-types'

import { Section, SectionHeading, type BlockBackground } from './Section'

/**
 * Renders a photo gallery.
 *
 * The scrolling variant uses CSS scroll-snap rather than a carousel library.
 * That means: no JavaScript at all, native touch and trackpad scrolling, real
 * keyboard scrolling, and it degrades to a plain scrollable row if anything
 * fails. A Swiper-style carousel would need ~40 KB of JS to reimplement
 * behaviour the browser already has, and would hide most of the photographs
 * behind controls that screen-reader users navigate poorly.
 */
export const GalleryBlockView = ({ block }: { block: GalleryBlock }) => {
  const images = (block.images ?? []).filter(
    (entry) => entry.image && typeof entry.image === 'object',
  )

  if (images.length === 0) return null

  const isGrid = block.layout === 'grid'

  return (
    <Section background={block.background as BlockBackground}>
      <SectionHeading
        heading={block.heading}
        accentWord={block.accentWord}
        level={block.headingLevel}
        className="mb-4"
      />

      {block.intro ? <RichText data={block.intro} className="mb-8 max-w-3xl" /> : null}

      <ul
        className={
          isGrid
            ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'
            : /*
               * `snap-x` plus `overflow-x-auto` gives native, momentum-friendly
               * scrolling. The negative margin lets cards bleed to the viewport
               * edge on a phone while the padding keeps the first one aligned
               * with the surrounding text.
               */
              'flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 -mx-5 px-5 [scrollbar-width:thin]'
        }
      >
        {images.map((entry, index) => {
          const media = entry.image as MediaDoc
          const caption = entry.caption || media.caption

          return (
            <li
              key={entry.id ?? index}
              className={
                isGrid
                  ? 'overflow-hidden rounded-2xl border-2 border-yellow bg-white shadow-card'
                  : 'w-[19rem] shrink-0 snap-start overflow-hidden rounded-2xl border-2 border-yellow bg-white shadow-card sm:w-[23rem]'
              }
            >
              <Media
                resource={media}
                sizes={
                  isGrid
                    ? '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw'
                    : '(min-width: 640px) 23rem, 19rem'
                }
                // Only the first image is likely above the fold.
                priority={index === 0}
                className="aspect-4/3 w-full object-cover"
              />

              {caption ? (
                <p className="px-4 py-3.5 text-sm font-medium text-ink-soft">{caption}</p>
              ) : null}
            </li>
          )
        })}
      </ul>

      {!isGrid && images.length > 1 ? (
        <p className="mt-1 text-sm text-ink-muted">
          Scroll sideways to see all {images.length} photographs.
        </p>
      ) : null}
    </Section>
  )
}
