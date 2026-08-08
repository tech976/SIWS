import type { ReactNode } from 'react'

/**
 * The shared shell every content block renders inside.
 *
 * Centralising background, spacing and heading treatment here is what keeps
 * four independently-managed unit sites visually identical (SRS 2.5) — a block
 * author cannot accidentally introduce different padding or an off-brand
 * colour.
 */

export type BlockBackground = 'white' | 'sea' | 'tint' | 'brand'

const BACKGROUND_CLASS: Record<BlockBackground, string> = {
  white: 'bg-white',
  sea: 'bg-sea',
  tint: 'bg-brand-tint',
  brand: 'bg-brand',
}

interface SectionProps {
  background?: BlockBackground | null
  children: ReactNode
  className?: string
  id?: string
}

export const Section = ({ background = 'white', children, className, id }: SectionProps) => {
  const variant = (background ?? 'white') as BlockBackground
  const inverted = variant === 'brand'

  return (
    <section
      id={id}
      // `data-invert` lets the stylesheet flip heading and body colours in one
      // place rather than every block re-deciding what "on brand" means.
      data-invert={inverted ? 'true' : undefined}
      className={[BACKGROUND_CLASS[variant] ?? BACKGROUND_CLASS.white, 'py-14 sm:py-20', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="siws-container">{children}</div>
    </section>
  )
}

interface SectionHeadingProps {
  heading?: string | null
  /** A phrase within the heading to highlight, per the SIWS house style. */
  accentWord?: string | null
  level?: 'h2' | 'h3' | null
  className?: string
}

/**
 * Renders a section heading, optionally highlighting one phrase.
 *
 * The heading level is authored rather than fixed, because visual prominence
 * and document outline position are independent — a section can look major
 * while correctly sitting at H3 (WCAG 2.1 SC 1.3.1).
 */
export const SectionHeading = ({
  heading,
  accentWord,
  level = 'h2',
  className,
}: SectionHeadingProps) => {
  if (!heading) return null

  const Tag = level === 'h3' ? 'h3' : 'h2'
  const classes = [
    level === 'h3' ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const accent = accentWord?.trim()
  const index = accent ? heading.indexOf(accent) : -1

  // Split on the first occurrence only; highlighting every instance of a common
  // word would be visually noisy and is never what the editor meant.
  if (!accent || index === -1) {
    return <Tag className={classes}>{heading}</Tag>
  }

  return (
    <Tag className={classes}>
      {heading.slice(0, index)}
      <span className="heading-accent">{accent}</span>
      {heading.slice(index + accent.length)}
    </Tag>
  )
}
