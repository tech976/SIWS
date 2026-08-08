import type { Block } from 'payload'

import { linkField } from '@/fields/link'
import { richTextField } from '@/fields/richText'

import { BLOCK_GROUPS, blockAdmin, headingField, sectionOptions } from './shared'

/**
 * Large photograph cards with the title set over the image — the
 * "Our Programs, your Future" row on the college site.
 *
 * Distinct from the card grid: those are small, text-led and may have no image
 * at all. These are image-led, and the picture is the point. Used for the two
 * or three big choices a visitor came to make — which programme, which section,
 * which campus.
 *
 * The image is REQUIRED here, unlike everywhere else in this platform. A card
 * whose whole design is a photograph has nothing to fall back to; a missing one
 * leaves a coloured rectangle with a word on it.
 */
export const ProgramCardsBlock: Block = {
  slug: 'programCards',
  interfaceName: 'ProgramCardsBlock',
  labels: { singular: 'Picture cards', plural: 'Picture cards' },
  admin: blockAdmin(BLOCK_GROUPS.lists),
  fields: [
    headingField,
    richTextField({
      name: 'intro',
      simple: true,
      admin: { description: 'Optional line under the heading.' },
    }),
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      labels: { singular: 'Card', plural: 'Cards' },
      admin: {
        initCollapsed: false,
        description: 'Two or three read best. Four is the most that will fit across.',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description:
              'A landscape photograph. If it shows an identifiable child, record the parental consent on the image first.',
          },
        },
        {
          name: 'caption',
          type: 'textarea',
          maxLength: 160,
          admin: { description: 'Optional. One short line under the title.' },
        },
        {
          // Optional, via the one-row-array pattern — see the note in
          // `AnnouncementsBlock`. A card may simply illustrate a section.
          name: 'cta',
          type: 'array',
          label: 'Link',
          maxRows: 1,
          labels: { singular: 'Link', plural: 'Link' },
          admin: { description: 'Optional. Makes the whole card clickable.' },
          fields: [linkField({ name: 'link', withLabel: false })],
        },
      ],
    },
    sectionOptions(),
  ],
}
