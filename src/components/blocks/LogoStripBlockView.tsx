import { Media } from '@/components/Media'
import type { LogoStripBlock } from '@/payload-types'

import { Section, SectionHeading, type BlockBackground } from './Section'

/**
 * A row of organisation logos.
 *
 * Every entry renders its NAME when it has no logo, rather than disappearing.
 * A strip that silently drops half its entries because the images have not been
 * uploaded yet looks finished when it is not.
 */
export const LogoStripBlockView = ({ block }: { block: LogoStripBlock }) => {
  const items = block.items ?? []
  if (items.length === 0) return null

  return (
    <Section background={block.background as BlockBackground}>
      <SectionHeading
        heading={block.heading}
        accentWord={block.accentWord}
        level={block.headingLevel}
        className=""
      />

      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-14">
        {items.map((item, index) => (
          <li key={item.id ?? index} className="flex items-center justify-center">
            {item.logo ? (
              <Media
                resource={item.logo}
                sizes="180px"
                /* Constrained by height, not width, so marks of different
                   aspect ratios sit on one optical baseline. */
                className="h-10 w-auto max-w-[170px] object-contain sm:h-12"
                alt={item.name}
              />
            ) : (
              <span className="text-lg font-semibold text-brand">{item.name}</span>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}
