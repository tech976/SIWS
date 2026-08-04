import type { Block } from 'payload'

import { richTextField } from '@/fields/richText'

import { BLOCK_GROUPS, blockAdmin, headingField, sectionOptions } from './shared'

/** A block of formatted prose — the workhorse of most informational pages. */
export const RichTextBlock: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  labels: { singular: 'Text section', plural: 'Text sections' },
  admin: blockAdmin(BLOCK_GROUPS.words),
  fields: [
    headingField,
    richTextField({ name: 'content', required: true }),
    sectionOptions([
      {
        name: 'width',
        type: 'select',
        defaultValue: 'normal',
        label: 'Text width',
        options: [
          { label: 'Normal', value: 'normal' },
          { label: 'Narrow — easiest to read', value: 'narrow' },
          { label: 'Full width', value: 'wide' },
        ],
        admin: {
          description: 'Narrow keeps lines to about 65 characters, the most comfortable length.',
        },
      },
    ]),
  ],
}
