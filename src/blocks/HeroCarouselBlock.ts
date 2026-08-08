import type { Block } from 'payload'

import { BLOCK_GROUPS, blockAdmin, optionalLink, sectionOptions } from './shared'

/**
 * The banner carousel at the top of the college home page — a run of
 * photographs, each with a caption panel over it.
 *
 * NO AUTO-ADVANCE. The reference rotates on a timer; WCAG 2.1 SC 2.2.2 requires
 * anything that moves automatically for more than five seconds to be pausable,
 * and a slide that changes while someone is halfway through reading its caption
 * is a problem for far more people than it is a feature. Arrows and dots move
 * it, and a swipe works on a phone.
 *
 * The captions on SIWS's own banners are long — full sentences about an award
 * and who presented it — so `caption` is a textarea rather than a line of
 * display type.
 */
export const HeroCarouselBlock: Block = {
  slug: 'heroCarousel',
  interfaceName: 'HeroCarouselBlock',
  labels: { singular: 'Banner carousel', plural: 'Banner carousels' },
  admin: blockAdmin(BLOCK_GROUPS.opening),
  fields: [
    {
      name: 'slides',
      type: 'array',
      minRows: 1,
      maxRows: 10,
      labels: { singular: 'Slide', plural: 'Slides' },
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description:
              'A wide photograph. If it shows an identifiable child, record the parental consent on the image first.',
          },
        },
        {
          name: 'title',
          type: 'text',
          admin: { description: 'Optional headline over the image.' },
        },
        {
          name: 'caption',
          type: 'textarea',
          maxLength: 600,
          admin: { description: 'Optional. What is happening in the photograph.' },
        },
        optionalLink({ label: 'Optional button' }),
      ],
    },
    {
      name: 'height',
      type: 'select',
      defaultValue: 'tall',
      label: 'Banner height',
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Tall', value: 'tall' },
      ],
    },
    sectionOptions(),
  ],
}
