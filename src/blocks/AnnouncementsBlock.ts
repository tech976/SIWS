import type { Block } from 'payload'

import { linkField } from '@/fields/link'

import { BLOCK_GROUPS, blockAdmin, sectionOptions } from './shared'

/**
 * The notice board — "Academic Announcements" on the college site.
 *
 * The single most-updated thing on a school site, and the reason a returning
 * parent visits at all: merit lists, exam forms, fee deadlines, timetables.
 *
 * Each notice links either to an uploaded document or to a page, using the
 * shared link field — so a removed target hides its notice rather than leaving
 * a dead link (FR-QL-06). The alternative, a typed URL, is how notice boards
 * rot.
 *
 * `date` is separate from the title so notices can be ordered and, later,
 * expired automatically. Schools write "last date 6th July" into the title and
 * then leave it up for a year; a real date field is what makes that fixable.
 */
export const AnnouncementsBlock: Block = {
  slug: 'announcements',
  interfaceName: 'AnnouncementsBlock',
  labels: { singular: 'Notice board', plural: 'Notice boards' },
  admin: blockAdmin(BLOCK_GROUPS.lists),
  fields: [
    // Declared rather than spread from `headingField`: that is typed as the
    // broad `Field` union, and spreading it collapses the discriminant so
    // Payload can no longer tell which kind of field this is.
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Academic Announcements',
      admin: { description: 'Optional.' },
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 50,
      labels: { singular: 'Notice', plural: 'Notices' },
      admin: {
        initCollapsed: true,
        description: 'Newest first. The list scrolls once it is longer than the panel.',
      },
      fields: [
        {
          name: 'title',
          type: 'textarea',
          required: true,
          maxLength: 300,
          admin: { description: 'What the notice says, in full.' },
        },
        {
          name: 'date',
          type: 'date',
          admin: {
            description: 'Optional. Shown beside the notice.',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
          },
        },
        {
          /**
           * An array of at most one, not a bare group — the pattern already used
           * for optional links elsewhere in this platform.
           *
           * `linkField` marks its target required, which is right once a link is
           * intended but wrong for the field as a whole: plenty of notices are
           * just an announcement with nowhere to go ("the school will remain
           * closed on Monday"). An empty array is how a notice says it has no
           * attachment.
           */
          name: 'cta',
          type: 'array',
          label: 'Attachment or link',
          maxRows: 1,
          labels: { singular: 'Link', plural: 'Link' },
          admin: {
            description: 'Optional. A document to open, or a page on this website.',
          },
          fields: [linkField({ name: 'link', relationTo: ['pages', 'media'], withLabel: false })],
        },
      ],
    },
    {
      name: 'maxHeight',
      type: 'select',
      defaultValue: 'medium',
      label: 'Panel height',
      options: [
        { label: 'Short — about 4 notices', value: 'short' },
        { label: 'Medium — about 6 notices', value: 'medium' },
        { label: 'Show them all', value: 'all' },
      ],
      admin: { description: 'Longer lists scroll inside the panel.' },
    },
    sectionOptions([], 'sea'),
  ],
}
