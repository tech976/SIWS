import { CMSLink, resolveCMSHref } from '@/components/CMSLink'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'
import type { CardGridBlock } from '@/payload-types'

import { Section, SectionHeading, type BlockBackground } from './Section'

const COLUMN_CLASS: Record<string, string> = {
  '2': 'sm:grid-cols-2',
  '3': 'sm:grid-cols-2 lg:grid-cols-3',
  '4': 'sm:grid-cols-2 lg:grid-cols-4',
}

const SIZES: Record<string, string> = {
  '2': '(min-width: 640px) 45vw, 100vw',
  '3': '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw',
  '4': '(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw',
}

export const CardGridBlockView = ({ block }: { block: CardGridBlock }) => {
  const columns = block.columns ?? '3'
  const cards = block.cards ?? []

  if (cards.length === 0) return null

  return (
    <Section background={block.background as BlockBackground}>
      {block.heading ? (
        <SectionHeading
          heading={block.heading}
          accentWord={block.accentWord}
          level={block.headingLevel}
          className="mb-4"
        />
      ) : null}

      {block.intro ? <RichText data={block.intro} className="mb-10 max-w-3xl" /> : null}

      <ul className={`grid gap-6 ${COLUMN_CLASS[columns] ?? COLUMN_CLASS['3']}`}>
        {cards.map((card, index) => {
          const link = card.cta?.[0]?.link
          const href = resolveCMSHref(link)

          return (
            <li
              key={card.id ?? index}
              // `relative` is what the title link's ::after overlay anchors to,
              // turning the whole card into the click target.
              className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-yellow bg-white shadow-card transition-transform focus-within:-translate-y-1 hover:-translate-y-1"
            >
              {card.image ? (
                <Media
                  resource={card.image}
                  sizes={SIZES[columns] ?? SIZES['3']}
                  className="aspect-4/3 w-full object-cover"
                />
              ) : null}

              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl">
                  {href && link ? (
                    /*
                     * The link wraps the title rather than the card. A card-wide
                     * anchor swallows the text selection and reads as one long
                     * link to a screen reader; the ::after span below restores
                     * the whole-card click target without either problem.
                     */
                    <CMSLink
                      link={link}
                      overrideClassName
                      className="after:absolute after:inset-0 after:content-[''] focus:outline-none"
                    >
                      {card.title}
                    </CMSLink>
                  ) : (
                    card.title
                  )}
                </h3>

                {card.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{card.description}</p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
