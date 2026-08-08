import Link from 'next/link'

import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'
import type { UnitLinksBlock, Unit } from '@/payload-types'

import { Section, SectionHeading, type BlockBackground } from './Section'

/**
 * Renders a card per active unit.
 *
 * The units are passed in by the route rather than fetched here, so the whole
 * page still costs one query for them however many times the block appears.
 */
export const UnitLinksBlockView = ({
  block,
  units,
}: {
  block: UnitLinksBlock
  units: Unit[]
}) => {
  if (units.length === 0) return null

  return (
    <Section background={block.background as BlockBackground}>
      <SectionHeading
        heading={block.heading}
        accentWord={block.accentWord}
        level={block.headingLevel}
        className="mb-3"
      />

      {block.intro ? <RichText data={block.intro} className="mb-10 max-w-2xl" /> : null}

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {units.map((unit) => (
          <li
            key={unit.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-transform focus-within:-translate-y-1 hover:-translate-y-1"
          >
            {unit.heroImage ? (
              <Media
                resource={unit.heroImage}
                sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw"
                className="aspect-4/3 w-full object-cover"
              />
            ) : null}

            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-xl">
                {/* The overlay makes the whole card clickable while keeping the
                    accessible name to just the school. */}
                <Link
                  href={`/${unit.slug}`}
                  className="after:absolute after:inset-0 after:content-['']"
                >
                  {unit.shortName}
                </Link>
              </h3>

              {unit.tagline ? (
                <p className="mt-1 text-sm font-semibold text-brand">{unit.tagline}</p>
              ) : null}

              {unit.description ? (
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{unit.description}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
