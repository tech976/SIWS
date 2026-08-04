import type { Page, Unit } from '@/payload-types'

import { AccordionBlockView } from './AccordionBlockView'
import { CallToActionBlockView } from './CallToActionBlockView'
import { CardGridBlockView } from './CardGridBlockView'
import { FacultyBlockView } from './FacultyBlockView'
import { FeatureListBlockView } from './FeatureListBlockView'
import { GalleryBlockView } from './GalleryBlockView'
import { HeroBlockView } from './HeroBlockView'
import { HeroEnquiryBlockView } from './HeroEnquiryBlockView'
import { MediaTextBlockView } from './MediaTextBlockView'
import { RichTextBlockView } from './RichTextBlockView'
import { StatisticsBlockView } from './StatisticsBlockView'
import { TestimonialsBlockView } from './TestimonialsBlockView'
import { UnitLinksBlockView } from './UnitLinksBlockView'

type LayoutBlock = NonNullable<Page['layout']>[number]

interface RenderBlocksProps {
  blocks?: LayoutBlock[] | null
  /**
   * All active units, for the "Our schools" block. Passed down rather than
   * fetched per block so the page costs one query for them however many times
   * the block is used.
   */
  units?: Unit[]
  /**
   * The unit whose site is being rendered. Threaded through because some blocks
   * are unit-aware — the enquiry form has to know which admissions inbox to
   * route to, and there is no request-scoped context available in RSC that
   * would carry it implicitly.
   */
  unit?: Unit | null
}

/**
 * Maps each stored block to its renderer.
 *
 * An unrecognised `blockType` renders nothing rather than throwing. That matters
 * during a deploy: if a content manager publishes a page using a block whose
 * renderer has not shipped yet, the rest of the page must still serve instead of
 * the whole route erroring.
 */
export const RenderBlocks = ({ blocks, unit = null, units = [] }: RenderBlocksProps) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return null

  return (
    <>
      {blocks.map((block, index) => {
        // `id` is assigned by Payload per row; the index is only a fallback for
        // content saved before that was the case.
        const key = block.id ?? `${block.blockType}-${index}`

        switch (block.blockType) {
          case 'hero':
            return <HeroBlockView key={key} block={block} />
          case 'unitLinks':
            return <UnitLinksBlockView key={key} block={block} units={units} />
          case 'richText':
            return <RichTextBlockView key={key} block={block} />
          case 'mediaText':
            return <MediaTextBlockView key={key} block={block} />
          case 'cardGrid':
            return <CardGridBlockView key={key} block={block} />
          case 'featureList':
            return <FeatureListBlockView key={key} block={block} />
          case 'faculty':
            return <FacultyBlockView key={key} block={block} unit={unit} />
          case 'gallery':
            return <GalleryBlockView key={key} block={block} />
          case 'accordion':
            return <AccordionBlockView key={key} block={block} index={index} />
          case 'testimonials':
            return <TestimonialsBlockView key={key} block={block} />
          case 'statistics':
            return <StatisticsBlockView key={key} block={block} />
          case 'callToAction':
            return <CallToActionBlockView key={key} block={block} />
          case 'heroEnquiry':
            return <HeroEnquiryBlockView key={key} block={block} unit={unit} />
          default:
            return null
        }
      })}
    </>
  )
}
