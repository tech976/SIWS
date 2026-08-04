import type { Block } from 'payload'

import { richTextField } from '@/fields/richText'

import { BLOCK_GROUPS, blockAdmin, headingField, sectionOptions } from './shared'

/**
 * SRS 4.1 — "Prominent links to each unit site."
 *
 * The cards are generated from the Units collection rather than being typed
 * into the block, so adding a fifth school later puts it on the portal
 * automatically and a renamed school cannot go stale here. That also means a
 * unit switched off with `isActive` disappears from the portal without anyone
 * remembering to edit this page.
 */
export const UnitLinksBlock: Block = {
  slug: 'unitLinks',
  interfaceName: 'UnitLinksBlock',
  labels: { singular: 'Our schools', plural: 'Our schools' },
  admin: blockAdmin(BLOCK_GROUPS.highlights),
  fields: [
    headingField,
    richTextField({
      name: 'intro',
      simple: true,
      admin: { description: 'Optional line above the cards.' },
    }),
    sectionOptions(),
  ],
}
