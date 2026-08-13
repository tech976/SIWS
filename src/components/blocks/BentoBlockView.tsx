import { Media } from '@/components/Media'
import type { BentoBlock } from '@/payload-types'

import { Section, SectionHeading, type BlockBackground } from './Section'

/**
 * A bento grid of mixed-size tiles.
 *
 * Built on a 4-column grid with a fixed row height rather than on auto-flow
 * masonry. Masonry decides its own arrangement, which means the tile an editor
 * marked as the important one can land anywhere — including last. A fixed grid
 * keeps authored order and authored emphasis.
 *
 * Tiles collapse to a single column on a phone, where "wide" and "large" have
 * no meaning: there is only one column, so every tile is full width and the
 * only thing that still matters is the order they were written in.
 */

const SIZE_CLASS: Record<string, string> = {
  small: 'sm:col-span-2 sm:row-span-1',
  wide: 'sm:col-span-4 sm:row-span-1',
  tall: 'sm:col-span-2 sm:row-span-2',
  large: 'sm:col-span-4 sm:row-span-2 lg:col-span-2',
}

const TONE_CLASS: Record<string, string> = {
  plain: 'bg-white border border-line',
  brand: 'bg-brand text-white',
  accent: 'bg-accent text-brand',
  photo: 'bg-brand',
}

export const BentoBlockView = ({ block }: { block: BentoBlock }) => {
  const tiles = (block.tiles ?? []).filter((t) => t.title || t.body || t.figure || t.image)
  if (tiles.length === 0) return null

  return (
    <Section background={block.background as BlockBackground}>
      {block.heading ? (
        <div className="mb-10">
          <SectionHeading
            heading={block.heading}
            accentWord={block.accentWord}
            level={block.headingLevel}
          />
          {block.intro ? (
            <p className="mx-auto mt-4 max-w-2xl text-center text-ink-muted">{block.intro}</p>
          ) : null}
        </div>
      ) : null}

      {/*
        9rem rows, not 11. A "small" tile is one row, and at 11rem a card
        holding a heading and one line of text was two-thirds empty — the grid
        read as a set of hollow boxes. The tiles now sit close to their
        content, and a photograph spanning two rows still has real presence.
      */}
      <ul className="grid grid-cols-1 gap-3 sm:auto-rows-[9rem] sm:grid-cols-4">
        {tiles.map((tile, index) => {
          const tone = tile.tone ?? 'plain'
          const isPhoto = tone === 'photo' && tile.image
          const inverted = tone === 'brand' || isPhoto

          return (
            <li
              key={tile.id ?? index}
              data-invert={inverted ? 'true' : undefined}
              /*
               * Only a photograph tile bottom-aligns: its text sits over the
               * picture, so it belongs at the foot where the wash is darkest.
               * A plain card has nothing behind it, and pushing its words to
               * the bottom left a block of dead space above every one of them.
               */
              className={`relative isolate flex flex-col overflow-hidden rounded-2xl p-5 sm:p-6 ${
                isPhoto ? 'justify-end' : 'justify-center'
              } ${
                SIZE_CLASS[tile.size ?? 'small'] ?? SIZE_CLASS.small
              } ${TONE_CLASS[tone] ?? TONE_CLASS.plain} ${
                // A photo tile needs a minimum height on a phone, where the
                // grid's fixed row height no longer applies.
                isPhoto ? 'min-h-56' : ''
              }`}
            >
              {isPhoto ? (
                <>
                  <Media
                    resource={tile.image}
                    sizes="(min-width: 640px) 50vw, 100vw"
                    fill
                    className="absolute inset-0 -z-20 object-cover object-[center_35%]"
                  />
                  {/*
                    Only as dark as the words on it need. A tile with no text
                    gets a much lighter wash, because there is nothing to
                    protect and the photograph is the whole point.
                  */}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 -z-10 ${
                      tile.title || tile.body || tile.figure
                        ? // Dark enough that white type is unambiguous.
                          'bg-gradient-to-t from-brand-deep/95 via-brand-deep/55 to-brand-deep/20'
                        : // No text to protect, so the photograph is left alone.
                          'bg-gradient-to-t from-brand-deep/20 to-transparent'
                    }`}
                  />
                </>
              ) : null}

              {tile.figure ? (
                <span className="block text-4xl leading-none tracking-tight sm:text-5xl">
                  {tile.figure}
                </span>
              ) : null}

              {tile.title ? (
                <h3 className={`text-xl ${tile.figure ? 'mt-3 text-base font-semibold' : ''}`}>
                  {tile.title}
                </h3>
              ) : null}

              {tile.body ? (
                /*
                 * Justified, with hyphenation, matching the body copy
                 * everywhere else on the site. A tile is narrow, so without
                 * `hyphens: auto` the justifier would stretch two or three
                 * words across the full width and open rivers straight down
                 * the card.
                 */
                <p
                  className={`siws-justify mt-2 text-sm leading-relaxed ${
                    inverted
                      ? 'text-white/85'
                      : /*
                         * An accent tile is yellow, and `text-ink-muted` was
                         * chosen to sit on white — on #ffaf2a it measures
                         * 3.58:1, under the 4.5:1 WCAG 2.1 AA needs for body
                         * text. Brand blue reaches 5.79:1 and matches the tile
                         * heading, which already inherits it.
                         */
                        tone === 'accent'
                        ? 'text-brand'
                        : 'text-ink-muted'
                  }`}
                >
                  {tile.body}
                </p>
              ) : null}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
