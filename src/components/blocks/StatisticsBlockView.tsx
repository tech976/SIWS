import { Media } from '@/components/Media'
import type { StatisticsBlock } from '@/payload-types'

import { SectionHeading } from './Section'

/**
 * The figures band.
 *
 * This is the page's proof, so it is built as the page's strongest moment
 * rather than as another white section: full-bleed, a photograph behind a deep
 * blue wash, and the figures reversed out of it.
 *
 * Three centred columns of dark text on white — what this was — is the shape
 * every institutional site uses. It states the numbers without asserting them.
 * A ninety-year-old school's figures ARE the argument, and they should stop
 * the reader rather than pass under them.
 *
 * The wash is a gradient rather than a flat tint: flat colour over a
 * photograph reads as a mistake, a directional gradient reads as intent, and
 * it lets the picture stay legible at the light end while guaranteeing
 * contrast for the text at the dark end. Deep blue at both ends means white
 * text clears 4.5:1 wherever it lands, whatever photograph is uploaded.
 *
 * Deliberately NOT wrapped in `Section`: this one runs edge to edge, and the
 * shared shell exists to keep every other block inside the same container.
 */
export const StatisticsBlockView = ({ block }: { block: StatisticsBlock }) => {
  const stats = block.stats ?? []
  if (stats.length === 0) return null

  return (
    <section data-invert="true" className="relative isolate overflow-hidden bg-brand">
      {block.image ? (
        <>
          <Media
            resource={block.image}
            sizes="100vw"
            fill
            className="absolute inset-0 -z-20 object-cover object-[center_38%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-deep/95 via-brand/90 to-brand-deep/97"
          />
        </>
      ) : null}

      <div className="siws-container py-16 sm:py-24">
        <div>
          {block.heading ? (
            <div className="mb-12">
              <SectionHeading
                heading={block.heading}
                accentWord={block.accentWord}
                level={block.headingLevel}
              />
              {block.intro ? (
                <p className="mx-auto mt-4 max-w-xl text-center text-white/75">{block.intro}</p>
              ) : null}
            </div>
          ) : null}

          <dl
            className={`grid gap-x-10 gap-y-12 text-center sm:grid-cols-2 ${
              stats.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
            }`}
          >
            {stats.map((stat, index) => (
              <div key={stat.id ?? index}>
                {/*
                  A short accent rule above each figure. It gives the eye a
                  consistent starting point across figures of very different
                  widths — "1934" and "KG–PG" do not align on their own.
                */}
                <span aria-hidden="true" className="mx-auto block h-1 w-10 rounded-full bg-accent" />

                {/*
                  The figure is the term and the caption its description, so
                  <dt> wraps the number. Visually the number leads;
                  `flex-col-reverse` would invert them in the DOM and break
                  that pairing, so the order is kept honest instead.
                */}
                {/*
                  `whitespace-nowrap` because a figure is a single token however
                  it is punctuated: "KG–PG" was breaking at the en-dash and
                  dropping "PG" onto a second line, which put that figure's
                  caption a line below the other two and broke the row's
                  baseline. Sized to fit the narrowest column at this weight.
                */}
                <dt className="mt-5 text-5xl leading-[0.95] tracking-tight whitespace-nowrap text-white sm:text-6xl">
                  {stat.value}
                </dt>
                <dd className="mx-auto mt-4 max-w-[22ch] text-base font-medium text-white/75">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
