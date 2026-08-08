import type { Block } from 'payload'

import { linkField } from '@/fields/link'

import { BLOCK_GROUPS, blockAdmin, sectionOptions } from './shared'

/**
 * A page-opening banner with no enquiry form.
 *
 * Distinct from `heroEnquiry`, which is bound to a unit's admissions inbox and
 * therefore cannot appear on the main SIWS portal — there is no single unit to
 * route an enquiry to. This is the hero for the portal and for inner pages that
 * want a strong opening without asking for anything.
 */
export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Page banner', plural: 'Page banners' },
  admin: blockAdmin(BLOCK_GROUPS.opening),
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Small line above the heading',
      admin: { description: 'Optional. e.g. "Since 1934".' },
    },
    {
      name: 'title',
      type: 'textarea',
      required: true,
      label: 'Heading',
    },
    {
      name: 'accentWord',
      type: 'text',
      label: 'Highlight a word',
      admin: { description: 'Optional. Type a word from the heading to show it in SIWS accent.' },
      validate: (value: unknown, { siblingData }: { siblingData?: { title?: string } }) => {
        if (!value || typeof value !== 'string') return true
        const title = siblingData?.title
        if (typeof title !== 'string' || !title.includes(value)) {
          return 'That word is not in the heading above. Check the spelling and capital letters.'
        }
        return true
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      maxLength: 500,
      label: 'Introduction',
      admin: { description: 'Optional. One or two sentences below the heading.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Background photograph',
      admin: {
        description:
          'Optional. A brand overlay keeps the text readable whichever picture you choose.',
      },
    },
    {
      name: 'links',
      type: 'array',
      label: 'Buttons',
      maxRows: 2,
      labels: { singular: 'Button', plural: 'Buttons' },
      fields: [linkField({ name: 'link', withAppearance: true })],
    },
    // This block owns its own heading controls above, so the shared ones are
    // suppressed to avoid declaring `accentWord` twice at the same level.
    sectionOptions([], 'brand', { headingControls: false }),
  ],
}
