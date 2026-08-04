import type { Block } from 'payload'

import { richTextField } from '@/fields/richText'

import { BLOCK_GROUPS, blockAdmin, headingField, sectionOptions } from './shared'

/**
 * Expand-and-collapse list. Used for question-and-answer content on ordinary
 * pages; the dedicated FAQ module (5.17) reuses the same presentation so the
 * two look identical to a visitor.
 */
export const AccordionBlock: Block = {
  slug: 'accordion',
  interfaceName: 'AccordionBlock',
  labels: { singular: 'Expandable list', plural: 'Expandable lists' },
  admin: blockAdmin(BLOCK_GROUPS.lists),
  fields: [
    headingField,
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Item', plural: 'Items' },
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          label: 'Question or title',
        },
        richTextField({ name: 'answer', label: 'Answer', required: true }),
      ],
    },
    {
      name: 'allowMultipleOpen',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'When ticked, visitors can have several items open at once. Untick to close the others as each one opens.',
      },
    },
    sectionOptions(),
  ],
}
