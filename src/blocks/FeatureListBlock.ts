import type { Block } from 'payload'

import { richTextField } from '@/fields/richText'

import { BLOCK_GROUPS, blockAdmin, headingField, sectionOptions } from './shared'

/**
 * A titled list of points, each with a short explanation — the pattern behind
 * "What Children Learn at SIWS" and "Why Parents Choose SIWS" on the approved
 * landing page.
 *
 * Distinct from the card grid: these read as a checklist of claims rather than
 * a set of destinations, so they carry no images or links and stack in a single
 * readable column.
 */
export const FeatureListBlock: Block = {
  slug: 'featureList',
  interfaceName: 'FeatureListBlock',
  labels: { singular: 'Points list', plural: 'Points lists' },
  admin: blockAdmin(BLOCK_GROUPS.lists),
  fields: [
    headingField,
    richTextField({
      name: 'intro',
      simple: true,
      admin: { description: 'Optional paragraph before the list.' },
    }),
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      /**
       * Ceilings raised from 10 rows / 280 characters after SIWS's own content
       * hit both: the school rules run to 19 numbered points, and the grade-wise
       * curriculum descriptions are a full paragraph each.
       *
       * The original figures were a guess at what "reads well", which is not a
       * limit worth enforcing against real content a school needs to publish.
       * These are now a guard against runaway input, not an editorial opinion.
       */
      maxRows: 30,
      labels: { singular: 'Point', plural: 'Points' },
      admin: { initCollapsed: false },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'description',
          type: 'textarea',
          maxLength: 600,
          admin: { description: 'A sentence or two explaining the point.' },
        },
      ],
    },
    sectionOptions([
      {
        name: 'marker',
        type: 'select',
        defaultValue: 'tick',
        label: 'Show each point with',
        options: [
          { label: 'A tick', value: 'tick' },
          { label: 'A number', value: 'number' },
        ],
        admin: { description: 'Choose numbers when the order matters, otherwise ticks.' },
      },
      {
        name: 'columns',
        type: 'select',
        defaultValue: '2',
        label: 'Layout',
        options: [
          { label: 'One column', value: '1' },
          { label: 'Two columns', value: '2' },
        ],
        admin: { description: 'Always a single column on phones.' },
      },
    ]),
  ],
}
