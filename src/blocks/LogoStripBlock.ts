import type { Block } from 'payload'

import { BLOCK_GROUPS, blockAdmin, headingField, sectionOptions } from './shared'

/**
 * A row of organisation logos — "Our Esteemed Recruiters" on the college site;
 * equally affiliations, boards or partners on a school one.
 *
 * NAMES ARE REQUIRED, LOGOS OPTIONAL — the reverse of what the reference does.
 * A logo is an image of a word: without alt text it is invisible to a screen
 * reader and to search, and a strip of eight of them can otherwise announce as
 * nothing at all. The name doubles as the alt text and shows when the image is
 * missing, so the section still says something on a slow connection.
 *
 * A note on rights: these marks belong to the organisations shown. The field
 * description says so, because a school listing a recruiter it has no
 * relationship with is a claim, not a decoration.
 */
export const LogoStripBlock: Block = {
  slug: 'logoStrip',
  interfaceName: 'LogoStripBlock',
  labels: { singular: 'Logo strip', plural: 'Logo strips' },
  admin: blockAdmin(BLOCK_GROUPS.lists),
  fields: [
    headingField,
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 24,
      labels: { singular: 'Organisation', plural: 'Organisations' },
      admin: {
        initCollapsed: false,
        description:
          'Only list organisations you actually have a relationship with, and use their logo only with their permission.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { description: 'Shown if there is no logo, and read aloud by screen readers.' },
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Optional. A wide image on a transparent or white background.' },
        },
      ],
    },
    sectionOptions(),
  ],
}
