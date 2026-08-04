import { RichText } from '@/components/RichText'
import type { RichTextBlock } from '@/payload-types'

import { Section, SectionHeading, type BlockBackground } from './Section'

const WIDTH_CLASS: Record<string, string> = {
  narrow: 'max-w-[65ch]',
  normal: 'max-w-4xl',
  wide: '',
}

export const RichTextBlockView = ({ block }: { block: RichTextBlock }) => (
  <Section background={block.background as BlockBackground}>
    <div className={WIDTH_CLASS[block.width ?? 'normal'] ?? WIDTH_CLASS.normal}>
      <SectionHeading
        heading={block.heading}
        accentWord={block.accentWord}
        level={block.headingLevel}
        className="mb-6"
      />
      <RichText data={block.content} />
    </div>
  </Section>
)
