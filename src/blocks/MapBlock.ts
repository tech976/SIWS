import type { Block } from 'payload'

import { BLOCK_GROUPS, blockAdmin, headingField, sectionOptions } from './shared'

/**
 * A location map (SRS 4.2 — "Google Maps location" on every unit's contact
 * section, and on the portal for the institution's own address).
 *
 * The editor types an ADDRESS, not an embed code or a pair of coordinates.
 * Asking a school office for an `<iframe>` from Google means either pasting
 * arbitrary third-party HTML into the page — which is a script-injection route
 * straight through the CMS — or teaching non-technical staff to read a map
 * URL. The address they already write on letterhead is enough: the component
 * builds the embed from it.
 */
export const MapBlock: Block = {
  slug: 'map',
  interfaceName: 'MapBlock',
  labels: { singular: 'Map', plural: 'Maps' },
  admin: blockAdmin(BLOCK_GROUPS.words),
  fields: [
    headingField,
    {
      name: 'address',
      type: 'textarea',
      required: true,
      maxLength: 300,
      label: 'Address',
      admin: {
        description:
          'The full postal address, as you would write it on a letter. The map finds it — e.g. "Sewree Estate, 337, Major R Parameswaran Rd, Wadala, Mumbai, Maharashtra 400031".',
      },
    },
    {
      name: 'label',
      type: 'text',
      maxLength: 80,
      label: 'Name of this place',
      admin: {
        description: 'Optional. Shown above the address — e.g. "SIWS Wadala campus".',
      },
    },
    {
      name: 'height',
      type: 'select',
      defaultValue: 'medium',
      label: 'Map height',
      options: [
        { label: 'Short', value: 'short' },
        { label: 'Medium', value: 'medium' },
        { label: 'Tall', value: 'tall' },
      ],
    },
    sectionOptions([], 'white'),
  ],
}
