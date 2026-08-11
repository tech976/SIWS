import type { Block } from 'payload'

import { BLOCK_GROUPS, blockAdmin } from './shared'

/**
 * A full-width photographic band that separates one section from the next.
 *
 * It carries no navigation and no argument — its job is to break a long page
 * into readable stretches and to let the school be seen between blocks of
 * prose. Because it is decorative, the photograph is always behind a colour
 * overlay: that guarantees any line of text on it stays legible whatever is
 * uploaded, and it stops a run of photographs taken on different days under
 * different light from making the page look assembled from parts.
 */
export const DividerBlock: Block = {
  slug: 'divider',
  interfaceName: 'DividerBlock',
  labels: { singular: 'Photo divider', plural: 'Photo dividers' },
  admin: blockAdmin(BLOCK_GROUPS.words),
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Photograph',
      admin: {
        description: 'Runs the full width of the screen, behind a colour overlay.',
      },
    },
    {
      name: 'text',
      type: 'textarea',
      maxLength: 160,
      label: 'Line across the band',
      admin: {
        description:
          'Optional. One short line — a value, a promise, a phrase. Leave blank for the photograph alone.',
      },
    },
    {
      name: 'attribution',
      type: 'text',
      maxLength: 60,
      label: 'Who said it',
      admin: {
        description: 'Optional. Only used when there is a line above.',
        condition: (_, siblingData) => Boolean(siblingData?.text),
      },
    },
    {
      name: 'overlay',
      type: 'select',
      defaultValue: 'brand',
      label: 'Overlay colour',
      options: [
        { label: 'Deep blue', value: 'brand' },
        { label: 'Sea blue', value: 'sea' },
        { label: 'Orange', value: 'accent' },
      ],
    },
    {
      /*
       * Marks a divider written by the placement seed, so a re-run can replace
       * its own and leave any an editor added by hand untouched.
       */
      name: 'placedBySeed',
      type: 'checkbox',
      defaultValue: false,
      admin: { hidden: true },
    },
    {
      name: 'height',
      type: 'select',
      defaultValue: 'slim',
      label: 'Band height',
      options: [
        { label: 'Slim — a break between sections', value: 'slim' },
        { label: 'Tall — a moment of its own', value: 'tall' },
      ],
    },
  ],
}
