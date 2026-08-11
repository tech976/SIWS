import { RichText } from '@/components/RichText'
import type { RichTextBlock } from '@/payload-types'

import { Section, SectionHeading, SectionSplit, type BlockBackground } from './Section'

export const RichTextBlockView = ({ block }: { block: RichTextBlock }) => {
  const background = block.background as BlockBackground

  /*
   * `narrow` is the one width that stays centred, because it is what editors
   * pick for a single statement — a vision, a quote, a notice. Those want to
   * be read as a unit with nothing beside them; hanging one off a heading rail
   * would leave two-thirds of the row empty and make the statement look like
   * an aside rather than the point of the section.
   */
  if (block.width === 'narrow') {
    return (
      <Section background={background}>
        {/*
          Left-aligned, not centred. A centred block of prose gives the eye no
          fixed left edge to return to on each line, which is why centred body
          copy is harder to read than the same text ranged left — and it
          detaches this section from the spine every other section on the page
          shares. The statement is set large and given a short accent rule
          instead, which is what makes it read as a statement.
        */}
        <div className="mx-auto max-w-[46rem] text-center">
          <span aria-hidden="true" className="mx-auto block h-1 w-12 rounded-full bg-accent" />
          <SectionHeading
            heading={block.heading}
            accentWord={block.accentWord}
            level={block.headingLevel}
            className="mt-6 mb-5"
          />
          <RichText data={block.content} className="text-xl leading-relaxed sm:text-2xl" />
        </div>
      </Section>
    )
  }

  return (
    <Section background={background}>
      <SectionSplit
        heading={block.heading}
        accentWord={block.accentWord}
        level={block.headingLevel}
      >
        <RichText data={block.content} />
      </SectionSplit>
    </Section>
  )
}
