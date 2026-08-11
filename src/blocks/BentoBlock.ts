import type { Block } from 'payload'

import { BLOCK_GROUPS, blockAdmin, headingField, sectionOptions } from './shared'

/**
 * A bento grid — tiles of different sizes, some carrying a photograph, some
 * carrying a short piece of text.
 *
 * It exists because a page of equal-weight sections reads as a list. Long runs
 * of "heading, paragraph, heading, paragraph" give the eye no hierarchy, and
 * a school page in particular needs somewhere the photographs and the claims
 * sit together rather than in separate bands.
 *
 * Tile size is authored, not automatic. An editor knows which of these points
 * is the one a parent should read first; a script guessing from text length
 * would make the longest tile the biggest, which is usually backwards.
 */
export const BentoBlock: Block = {
  slug: 'bento',
  interfaceName: 'BentoBlock',
  labels: { singular: 'Bento grid', plural: 'Bento grids' },
  admin: blockAdmin(BLOCK_GROUPS.lists),
  fields: [
    headingField,
    {
      name: 'intro',
      type: 'textarea',
      maxLength: 240,
      label: 'Line under the heading',
      admin: { description: 'Optional.' },
    },
    {
      name: 'tiles',
      type: 'array',
      minRows: 2,
      maxRows: 8,
      labels: { singular: 'Tile', plural: 'Tiles' },
      admin: {
        description:
          'Mix wide, tall and small tiles. Two or three large ones among smaller tiles reads best — all-large is a list again.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'size',
              type: 'select',
              defaultValue: 'small',
              label: 'Tile size',
              options: [
                { label: 'Small — one square', value: 'small' },
                { label: 'Wide — two across', value: 'wide' },
                { label: 'Tall — two down', value: 'tall' },
                { label: 'Large — two by two', value: 'large' },
              ],
              admin: { width: '50%' },
            },
            {
              name: 'tone',
              type: 'select',
              defaultValue: 'plain',
              label: 'Tile style',
              options: [
                { label: 'Photograph', value: 'photo' },
                { label: 'Plain card', value: 'plain' },
                { label: 'Brand card', value: 'brand' },
                { label: 'Accent card', value: 'accent' },
              ],
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Photograph',
          admin: {
            description: 'Required for a photograph tile; ignored on the others.',
            condition: (_, sibling) => sibling?.tone === 'photo',
          },
        },
        {
          name: 'title',
          type: 'text',
          maxLength: 60,
          label: 'Tile heading',
        },
        {
          name: 'body',
          type: 'textarea',
          maxLength: 260,
          label: 'Tile text',
          admin: { description: 'Optional. Keep it short — a tile is not a paragraph.' },
        },
        {
          name: 'figure',
          type: 'text',
          maxLength: 12,
          label: 'Big figure',
          admin: {
            description:
              'Optional. Shown large — "1934", "92+". Use instead of tile text, not as well.',
          },
        },
      ],
    },
    {
      /* Marks a grid written by the seed, so a re-run replaces its own. */
      name: 'placedBySeed',
      type: 'checkbox',
      defaultValue: false,
      admin: { hidden: true },
    },
    sectionOptions([], 'white'),
  ],
}
