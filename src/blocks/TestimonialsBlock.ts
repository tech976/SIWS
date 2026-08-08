import type { Block } from 'payload'

import { BLOCK_GROUPS, blockAdmin, headingField, sectionOptions } from './shared'

/**
 * Parent and alumni testimonials.
 *
 * Rendered as a static, readable grid rather than the auto-rotating carousel in
 * the original template. An auto-advancing carousel moves content out from under
 * someone mid-sentence, which fails WCAG 2.1 SC 2.2.2 unless it ships pause
 * controls — and on a page this short there is no space pressure that justifies
 * hiding two of three quotes behind an interaction.
 */
export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  interfaceName: 'TestimonialsBlock',
  labels: { singular: 'Testimonials', plural: 'Testimonials' },
  admin: blockAdmin(BLOCK_GROUPS.highlights),
  fields: [
    headingField,
    {
      name: 'quotes',
      type: 'array',
      minRows: 1,
      maxRows: 9,
      labels: { singular: 'Quote', plural: 'Quotes' },
      fields: [
        {
          name: 'quote',
          type: 'textarea',
          required: true,
          maxLength: 400,
          admin: {
            description:
              'What they said. Do not add quotation marks — those are added automatically.',
          },
        },
        {
          name: 'attribution',
          type: 'text',
          required: true,
          admin: {
            description:
              'Who said it, e.g. "Parent" or "Alumni parent". Only use a full name with their written permission.',
          },
        },
        {
          name: 'detail',
          type: 'text',
          admin: { description: 'Optional extra context, e.g. "Jr. KG parent, 2025".' },
        },
      ],
    },
    sectionOptions([], 'sea'),
  ],
}
