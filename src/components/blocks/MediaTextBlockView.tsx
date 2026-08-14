import { CMSLink } from '@/components/CMSLink'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'
import type { MediaTextBlock } from '@/payload-types'

import { Section, SectionHeading, type BlockBackground } from './Section'

/**
 * The ratio is held by the wrapper, with the photograph filling it.
 *
 * Putting an `aspect-*` class on the image itself does nothing: `next/image`
 * writes real width and height attributes from the upload, and the base
 * `img { height: auto }` rule then wins over the ratio — so a portrait
 * snapshot rendered a metre tall beside three lines of text, and the two
 * columns no longer balanced.
 *
 * `4/5` rather than a square or a letterbox: a portrait-ish frame sits level
 * with a column of prose without either side leaving a gap.
 */
/**
 * The frame keeps a fixed ratio while stacked, and matches the text column's
 * height once the two sit side by side.
 *
 * A fixed ratio at every width cannot work here: it ties the picture's height
 * to the column's WIDTH, while the text's height comes from how much of it
 * there is. So the two columns only agreed when a section's prose happened to
 * run to the right length — About SIWS, at four paragraphs, left a 213px step
 * beside its photograph while Our History, at three, looked fine.
 *
 * From `lg` the frame stretches to the row instead, so the columns are level
 * whatever an editor writes. Below `lg` the columns are stacked and there is
 * no row to match, so the ratio is what stops a portrait upload running off
 * the screen.
 *
 * The circle is exempt: a circle stretched to a text column is an ellipse.
 */
const SHAPE_CLASS: Record<string, string> = {
  /*
   * THE FRAME STRETCHES TO THE ROW ON DESKTOP.
   *
   * A fixed ratio was tried here to stop a photograph being cropped, and it
   * cost too much: on the portal, where these sections carry several
   * paragraphs, the picture no longer grew with the text and the History and
   * About bands visibly shrank. The stretch is what makes the image read as
   * the subject of the band rather than as an illustration beside it.
   *
   * The cropping it can cause is fixed at the source instead — by uploading a
   * LANDSCAPE photograph. A portrait upload stretched into a wide frame loses
   * its top and bottom, which is where faces are; that is what went wrong on
   * Primary, and the answer was a better photograph, not a smaller frame.
   */
  rounded: 'rounded-2xl aspect-[5/4] lg:aspect-auto lg:h-full',
  square: 'rounded-none aspect-[5/4] lg:aspect-auto lg:h-full',
  circle: 'rounded-full aspect-square',
}

export const MediaTextBlockView = ({ block }: { block: MediaTextBlock }) => {
  const imageFirst = block.imagePosition !== 'right'
  const cta = block.cta?.[0]?.link

  /* ------------------------------------------------------------- image above
   *
   * A stacked band: heading, then the photograph across the full measure, then
   * the words beneath it.
   *
   * The side-by-side split is right when the text has enough substance to hold
   * its own column. When it is two or three lines it does not — the column runs
   * out halfway down and leaves a pane of empty white beside a tall picture,
   * which is what "the alignment is not correct" meant. Stacking gives the
   * photograph the whole width, which is the point of choosing this option, and
   * the short text sits under it as a caption would.
   *
   * The frame keeps a wide ratio rather than stretching: there is no text
   * column beside it to match a height to.
   */
  if (block.imagePosition === 'above') {
    return (
      <Section background={block.background as BlockBackground}>
        <div className="mb-10">
          <span aria-hidden="true" className="mx-auto mb-5 block h-1 w-12 rounded-full bg-accent" />
          <SectionHeading
            heading={block.heading}
            accentWord={block.accentWord}
            level={block.headingLevel}
          />
        </div>

        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-card sm:aspect-[21/9]">
          <Media resource={block.image} sizes="100vw" fill className="object-cover" />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand/45 via-brand/5 to-transparent"
          />
        </div>

        {/*
          A measured column under a full-width picture. Left to the container
          the line would run the whole 1200px and be unreadable; centred, it
          sits on the same axis as the heading above it.
        */}
        <div className="siws-centre mx-auto mt-10 max-w-3xl">
          <RichText data={block.content} />

          {cta ? (
            <div className="mt-7">
              <CMSLink link={cta} />
            </div>
          ) : null}
        </div>
      </Section>
    )
  }

  return (
    <Section background={block.background as BlockBackground}>
      {/*
        The heading sits above the split, not inside the text column.
        Alternating the photograph left and right is what gives a run of these
        sections any rhythm — but with the heading inside the text column, a
        right-hand photograph pushed the heading to the middle of the page
        while every other section on the site started at the left margin. One
        heading 600px out of line breaks the spine the whole page is read
        against. Lifting it out keeps the alternation and the alignment.
      */}
      <div className="mb-10">
        <span aria-hidden="true" className="mx-auto mb-5 block h-1 w-12 rounded-full bg-accent" />
        <SectionHeading
          heading={block.heading}
          accentWord={block.accentWord}
          level={block.headingLevel}
        />
      </div>

      {/*
        The photograph gets the larger share, 7 columns to the text's 5.
        At an even split the picture was the same width as a column of prose
        and read as an illustration beside the text rather than as the subject
        of the band — which is what "the image is small" meant.
      */}
      <div className="grid items-stretch gap-10 lg:grid-cols-12 lg:gap-14">
        <div
          className={[
            // On a phone the image always leads, whichever side was chosen —
            // `order` only applies once there are two columns to order.
            imageFirst ? 'lg:order-1' : 'lg:order-2',
            'lg:col-span-7',
            // Passes the stretched row height down to the frame inside.
            'lg:min-h-96',
          ].join(' ')}
        >
          <div
            className={`relative w-full overflow-hidden shadow-card ${
              SHAPE_CLASS[block.imageShape ?? 'rounded'] ?? SHAPE_CLASS.rounded
            }`}
          >
            <Media
              resource={block.image}
              sizes="(min-width: 1024px) 45vw, 100vw"
              fill
              className="object-cover"
            />
            {/*
              A blue wash rising from the foot of the frame. It ties the
              photographs to the palette so a set of pictures taken on
              different days under different light still reads as one page,
              and it weights the bottom of the frame so the image sits
              against the text column instead of floating beside it.
              Transparent for the top two-thirds, so the subject is untouched.
            */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand/55 via-brand/10 to-transparent"
            />
          </div>
        </div>

        <div className={`flex flex-col justify-center lg:col-span-5 ${imageFirst ? 'lg:order-2' : 'lg:order-1'}`}>
          <RichText data={block.content} />

          {cta ? (
            <div className="mt-7">
              <CMSLink link={cta} />
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  )
}
