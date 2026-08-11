import type { Block } from 'payload'

import { BLOCK_GROUPS, blockAdmin, headingField, sectionOptions } from './shared'

/** Headline figures — years of legacy, students, results. */
export const StatisticsBlock: Block = {
  slug: 'statistics',
  interfaceName: 'StatisticsBlock',
  labels: { singular: 'Key figures', plural: 'Key figures' },
  admin: blockAdmin(BLOCK_GROUPS.highlights),
  fields: [
    headingField,
    {
      name: 'intro',
      type: 'textarea',
      maxLength: 220,
      label: 'Line under the heading',
      admin: { description: 'Optional. One sentence saying what these figures show.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Background photograph',
      admin: {
        description:
          'Optional. The figures are laid over it behind a deep blue wash, so any photograph stays readable. Without one the figures sit on plain brand colour.',
      },
    },
    {
      name: 'stats',
      type: 'array',
      minRows: 2,
      maxRows: 4,
      labels: { singular: 'Figure', plural: 'Figures' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
              admin: { width: '40%', description: 'e.g. "92" or "100%".' },
            },
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: { width: '60%', description: 'e.g. "Years of educational legacy".' },
            },
          ],
        },
      ],
    },
    sectionOptions([], 'sea'),
  ],
}
