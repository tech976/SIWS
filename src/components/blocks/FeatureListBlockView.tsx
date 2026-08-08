import { Check } from 'lucide-react'

import { RichText } from '@/components/RichText'
import type { FeatureListBlock } from '@/payload-types'

import { Section, SectionHeading, type BlockBackground } from './Section'

export const FeatureListBlockView = ({ block }: { block: FeatureListBlock }) => {
  const items = block.items ?? []
  if (items.length === 0) return null

  const numbered = block.marker === 'number'
  const twoColumns = block.columns !== '1'

  return (
    <Section background={block.background as BlockBackground}>
      <SectionHeading
        heading={block.heading}
        accentWord={block.accentWord}
        level={block.headingLevel}
        className="mb-4"
      />

      {block.intro ? <RichText data={block.intro} className="mb-9 max-w-3xl" /> : null}

      {/*
        An ordered list when the marker is a number, so the numbering is real
        rather than painted on — a screen reader then announces "1 of 5".
      */}
      {numbered ? (
        <ol className={`grid gap-x-10 gap-y-6 ${twoColumns ? 'md:grid-cols-2' : 'max-w-3xl'}`}>
          {items.map((item, index) => (
            <Item key={item.id ?? index} item={item} index={index} numbered />
          ))}
        </ol>
      ) : (
        <ul className={`grid gap-x-10 gap-y-6 ${twoColumns ? 'md:grid-cols-2' : 'max-w-3xl'}`}>
          {items.map((item, index) => (
            <Item key={item.id ?? index} item={item} index={index} numbered={false} />
          ))}
        </ul>
      )}
    </Section>
  )
}

const Item = ({
  item,
  index,
  numbered,
}: {
  item: NonNullable<FeatureListBlock['items']>[number]
  index: number
  numbered: boolean
}) => (
  <li className="flex items-start gap-4">
    <span
      aria-hidden="true"
      className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-sea text-sm font-bold text-brand"
    >
      {numbered ? index + 1 : <Check size={17} strokeWidth={3} />}
    </span>
    <span>
      <strong className="block text-[1.05rem] text-brand">{item.title}</strong>
      {item.description ? (
        <span className="mt-1 block text-ink-soft">{item.description}</span>
      ) : null}
    </span>
  </li>
)
