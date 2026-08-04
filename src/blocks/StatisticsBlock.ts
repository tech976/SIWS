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
    sectionOptions([], 'cream'),
  ],
}
