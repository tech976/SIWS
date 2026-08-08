import { Quote } from 'lucide-react'

import type { TestimonialsBlock } from '@/payload-types'

import { Section, SectionHeading, type BlockBackground } from './Section'

export const TestimonialsBlockView = ({ block }: { block: TestimonialsBlock }) => {
  const quotes = block.quotes ?? []
  if (quotes.length === 0) return null

  return (
    <Section background={block.background as BlockBackground}>
      <SectionHeading
        heading={block.heading}
        accentWord={block.accentWord}
        level={block.headingLevel}
        className="mb-10 text-center"
      />

      <ul
        className={`grid gap-6 ${
          quotes.length === 1
            ? 'max-w-2xl mx-auto'
            : quotes.length === 2
              ? 'sm:grid-cols-2'
              : 'sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {quotes.map((entry, index) => (
          <li
            key={entry.id ?? index}
            className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-[0_6px_15px_rgba(0,0,0,0.06)]"
          >
            <span aria-hidden="true" className="text-accent-deep">
              <Quote size={26} strokeWidth={2.5} />
            </span>

            {/*
              `<blockquote>` marks this as quoted speech, and the quotation
              marks are added by the stylesheet-free `“”` below rather than
              being typed into the CMS — so an editor cannot end up with
              doubled quotes.
            */}
            <blockquote className="mt-3 flex-1 text-[1.02rem] leading-relaxed text-ink-soft">
              &ldquo;{entry.quote}&rdquo;
            </blockquote>

            <footer className="mt-5 border-t border-line pt-4">
              <cite className="block font-semibold not-italic text-brand">
                — {entry.attribution}
              </cite>
              {entry.detail ? (
                <span className="mt-0.5 block text-sm text-ink-muted">{entry.detail}</span>
              ) : null}
            </footer>
          </li>
        ))}
      </ul>
    </Section>
  )
}
