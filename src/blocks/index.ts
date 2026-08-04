import type { Block } from 'payload'

import { AccordionBlock } from './AccordionBlock'
import { CallToActionBlock } from './CallToActionBlock'
import { CardGridBlock } from './CardGridBlock'
import { FacultyBlock } from './FacultyBlock'
import { FeatureListBlock } from './FeatureListBlock'
import { GalleryBlock } from './GalleryBlock'
import { HeroBlock } from './HeroBlock'
import { HeroEnquiryBlock } from './HeroEnquiryBlock'
import { MediaTextBlock } from './MediaTextBlock'
import { RichTextBlock } from './RichTextBlock'
import { StatisticsBlock } from './StatisticsBlock'
import { UnitLinksBlock } from './UnitLinksBlock'
import { TestimonialsBlock } from './TestimonialsBlock'

/**
 * FR-CMS-01 — the content blocks from which pages are assembled without code.
 *
 * Adding a block here plus a matching renderer in `components/blocks` extends
 * every page type at once, which is the mechanism behind "new units, sites or
 * pages can be added without redevelopment" (SRS 7, Maintainability).
 *
 * Ordered roughly by how often a content manager reaches for each one, since
 * this is the order they appear in the "add section" menu.
 */
export const contentBlocks: Block[] = [
  HeroBlock,
  RichTextBlock,
  MediaTextBlock,
  CardGridBlock,
  FeatureListBlock,
  FacultyBlock,
  GalleryBlock,
  AccordionBlock,
  TestimonialsBlock,
  StatisticsBlock,
  UnitLinksBlock,
  CallToActionBlock,
  HeroEnquiryBlock,
]

export {
  AccordionBlock,
  FacultyBlock,
  CallToActionBlock,
  CardGridBlock,
  FeatureListBlock,
  GalleryBlock,
  HeroBlock,
  HeroEnquiryBlock,
  MediaTextBlock,
  RichTextBlock,
  StatisticsBlock,
  TestimonialsBlock,
  UnitLinksBlock,
}
