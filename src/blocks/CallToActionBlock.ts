import type { Block } from 'payload'

import { linkField } from '@/fields/link'
import { richTextField } from '@/fields/richText'

import { BLOCK_GROUPS, blockAdmin, sectionOptions } from './shared'

/** A prominent banner driving one or two specific actions. */
export const CallToActionBlock: Block = {
  slug: 'callToAction',
  interfaceName: 'CallToActionBlock',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  admin: blockAdmin(BLOCK_GROUPS.highlights),
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    richTextField({
      name: 'text',
      simple: true,
      admin: { description: 'Optional supporting sentence.' },
    }),
    {
      name: 'links',
      type: 'array',
      minRows: 1,
      // More than two competing actions reliably reduces the number of people
      // who take any of them.
      maxRows: 2,
      labels: { singular: 'Button', plural: 'Buttons' },
      fields: [linkField({ name: 'link', withAppearance: true })],
    },
    sectionOptions([], 'purple'),
  ],
}
