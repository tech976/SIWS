import type { StatisticsBlock } from '@/payload-types'

import { Section, SectionHeading, type BlockBackground } from './Section'

export const StatisticsBlockView = ({ block }: { block: StatisticsBlock }) => {
  const stats = block.stats ?? []
  if (stats.length === 0) return null

  return (
    <Section background={block.background as BlockBackground}>
      <SectionHeading
        heading={block.heading}
        accentWord={block.accentWord}
        level={block.headingLevel}
        className="mb-10 text-center"
      />

      <dl
        className={`grid gap-8 text-center ${
          stats.length === 2 ? 'sm:grid-cols-2' : stats.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {stats.map((stat, index) => (
          <div key={stat.id ?? index}>
            {/*
              The figure is the term and the caption its description, so <dt>
              wraps the number. Visually the number leads; `flex-col-reverse`
              would invert them in the DOM and break that pairing, so the order
              is kept honest instead.
            */}
            <dt className="font-[family-name:var(--font-display)] text-4xl leading-none text-purple sm:text-5xl">
              {stat.value}
            </dt>
            <dd className="mt-3 text-sm font-medium text-ink-muted">{stat.label}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}
