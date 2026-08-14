import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'
import type { GalleryBlock, Media as MediaDoc } from '@/payload-types'

import { GalleryPager } from './GalleryPager'
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
  /**
   * 12 fills four rows of three on a desktop and reads as a complete page.
   * Only applied to the grid: the scrolling row is already self-limiting, and
   * paginating something you scroll through would be two controls for one job.
   */
  const perPageSetting = Number(block.perPage ?? '12')
  const perPage = perPageSetting > 0 ? perPageSetting : images.length

  const cards = images.map((entry, index) => {
    const media = entry.image as MediaDoc
    const caption = entry.caption || media.caption

    return (
      <li
        key={entry.id ?? index}
        className={
          isGrid
            ? 'group overflow-hidden rounded-2xl border border-line bg-white shadow-card'
            : 'group w-76 shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-white shadow-card sm:w-92'
        }
      >
        {/*
          The ratio lives on this wrapper with the photograph filling it.
          `aspect-*` on the image itself is overridden by the base
          `img { height: auto }` rule, because `next/image` writes real width
          and height attributes — so a grid of mixed portrait and landscape
          uploads came out ragged, every tile a different height.
        */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Media
            resource={media}
            sizes={
              isGrid
                ? '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw'
                : '(min-width: 640px) 23rem, 19rem'
            }
            // Only the first image is likely above the fold.
            priority={index === 0}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/*
            A gallery is the one place the photographs should be seen at full
            strength. The page's blue wash sat over every tile at 45% and
            flattened the whole wall to the same dull cast — the tint that ties
            a single feature image to the palette turns a grid of twelve into
            mud. It now appears only under the pointer, where it reads as a
            response to the visitor rather than as a filter over the picture.
          */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand/55 via-brand/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </div>

        {caption ? (
          <p className="px-4 py-3.5 text-sm font-medium text-ink-soft">{caption}</p>
        ) : null}
      </li>
    )
  })

  return (
    <Section background={block.background as BlockBackground}>
      <SectionHeading
        heading={block.heading}
        accentWord={block.accentWord}
        level={block.headingLevel}
        className="mb-4"
      />

      {block.intro ? <RichText data={block.intro} className="mb-8 siws-centre mx-auto max-w-3xl" /> : null}

      {isGrid && images.length > perPage ? (
        <GalleryPager items={cards} perPage={perPage} />
      ) : (
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
        {cards}
      </ul>
      )}

      {!isGrid && images.length > 1 ? (
        <p className="mt-1 text-sm text-ink-muted">
          Scroll sideways to see all {images.length} photographs.
        </p>
      ) : null}
    </Section>
  )
}
