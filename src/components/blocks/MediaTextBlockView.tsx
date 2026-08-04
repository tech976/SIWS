import { CMSLink } from '@/components/CMSLink'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'
import type { MediaTextBlock } from '@/payload-types'

import { Section, SectionHeading, type BlockBackground } from './Section'

const SHAPE_CLASS: Record<string, string> = {
  rounded: 'rounded-2xl',
  square: 'rounded-none',
  circle: 'rounded-full aspect-square object-cover',
}

export const MediaTextBlockView = ({ block }: { block: MediaTextBlock }) => {
  const imageFirst = block.imagePosition !== 'right'
  const cta = block.cta?.[0]?.link

  return (
    <Section background={block.background as BlockBackground}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div
          className={[
            // On a phone the image always leads, whichever side was chosen —
            // `order` only applies once there are two columns to order.
            imageFirst ? 'lg:order-1' : 'lg:order-2',
          ].join(' ')}
        >
          <Media
            resource={block.image}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className={`w-full ${SHAPE_CLASS[block.imageShape ?? 'rounded'] ?? SHAPE_CLASS.rounded}`}
          />
        </div>

        <div className={imageFirst ? 'lg:order-2' : 'lg:order-1'}>
          <SectionHeading
            heading={block.heading}
            accentWord={block.accentWord}
            level={block.headingLevel}
            className="mb-5"
          />
          <RichText data={block.content} />

          {cta ? (
            <div className="mt-7">
              <CMSLink link={cta} />
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  )
}
