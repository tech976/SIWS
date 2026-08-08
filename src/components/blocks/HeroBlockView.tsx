import { CMSLink } from '@/components/CMSLink'
import { Media } from '@/components/Media'
import type { HeroBlock } from '@/payload-types'

import { type BlockBackground } from './Section'

const BACKGROUND_CLASS: Record<BlockBackground, string> = {
  white: 'bg-white',
  sea: 'bg-sea',
  tint: 'bg-brand-tint',
  brand: 'bg-brand',
}

/**
 * A page-opening banner.
 *
 * Not built on `Section` because a hero needs an edge-to-edge background image
 * beneath its container, which the shared section wrapper does not provide.
 */
export const HeroBlockView = ({ block }: { block: HeroBlock }) => {
  const variant = (block.background ?? 'brand') as BlockBackground
  const inverted = variant === 'brand'
  const links = block.links ?? []

  const accent = block.accentWord?.trim()
  const index = accent && block.title ? block.title.indexOf(accent) : -1

  return (
    <section
      data-invert={inverted ? 'true' : undefined}
      className={`relative isolate overflow-hidden ${BACKGROUND_CLASS[variant] ?? BACKGROUND_CLASS.brand}`}
    >
      {block.image ? (
        <>
          <Media
            resource={block.image}
            sizes="100vw"
            priority
            fill
            className="absolute inset-0 -z-20 object-cover"
          />
          {/* Guarantees contrast regardless of which photograph is uploaded. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-br from-brand/95 via-brand/90 to-brand-deep/95"
          />
        </>
      ) : null}

      <div className="siws-container py-16 sm:py-24">
        {block.eyebrow ? (
          /**
           * Body face, not the handwriting one.
           *
           * This line carries factual detail — board, grades, campuses — and
           * Bright Chalk renders that as a scrawl: the pipes turn into strokes
           * and the numerals are hard to read at this size. It is set as a
           * small, spaced, uppercase label instead, which is how the college
           * site treats the same line.
           */
          <p
            className={`text-sm font-semibold tracking-[0.14em] uppercase ${
              inverted ? 'text-accent' : 'text-brand'
            }`}
          >
            {block.eyebrow}
          </p>
        ) : null}

        <h1 className="mt-2 max-w-4xl text-4xl sm:text-5xl lg:text-6xl">
          {index >= 0 && accent ? (
            <>
              {block.title.slice(0, index)}
              <span className="heading-accent">{accent}</span>
              {block.title.slice(index + accent.length)}
            </>
          ) : (
            block.title
          )}
        </h1>

        {block.intro ? (
          <p
            className={`mt-6 max-w-2xl text-lg ${inverted ? 'text-white/90' : 'text-ink-soft'}`}
          >
            {block.intro}
          </p>
        ) : null}

        {links.length > 0 ? (
          <div className="mt-9 flex flex-wrap gap-4">
            {links.map((entry, i) => (
              <CMSLink key={entry.id ?? i} link={entry.link} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
