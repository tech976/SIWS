import type { Block } from 'payload'

import { linkField } from '@/fields/link'

import { BLOCK_GROUPS, blockAdmin, headingField, sectionOptions } from './shared'

/**
 * A row of solid, high-contrast signpost buttons — the "Discover SIWS /
 * Management / Organogram" band on the college site.
 *
 * Deliberately text-only. These sit between two picture-heavy sections and
 * their job is to be scanned in a second, which images would work against.
 *
 * Icons are chosen from a fixed list rather than uploaded. A content manager
 * picking their own would produce a row of mismatched sizes and weights, and
 * the row's whole effect depends on the glyphs being identical in build.
 */
export const QuickNavBlock: Block = {
  slug: 'quickNav',
  interfaceName: 'QuickNavBlock',
  labels: { singular: 'Signpost buttons', plural: 'Signpost buttons' },
  admin: blockAdmin(BLOCK_GROUPS.lists),
  fields: [
    headingField,
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      labels: { singular: 'Button', plural: 'Buttons' },
      admin: { initCollapsed: false, description: 'Three across reads best.' },
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'building',
          options: [
            { label: 'Building', value: 'building' },
            { label: 'People', value: 'people' },
            { label: 'Chart', value: 'chart' },
            { label: 'Book', value: 'book' },
            { label: 'Calendar', value: 'calendar' },
            { label: 'Document', value: 'document' },
            { label: 'Award', value: 'award' },
            { label: 'Compass', value: 'compass' },
          ],
        },
        linkField({ name: 'link', withLabel: false }),
      ],
    },
    sectionOptions(),
  ],
}
