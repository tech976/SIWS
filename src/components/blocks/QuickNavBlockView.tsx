import {
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronRight,
  Compass,
  FileText,
  PieChart,
  Users,
} from 'lucide-react'
import type { ComponentType } from 'react'

import { CMSLink } from '@/components/CMSLink'
import type { QuickNavBlock } from '@/payload-types'

import { Section, SectionHeading, type BlockBackground } from './Section'

const ICONS: Record<string, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  building: Building2,
  people: Users,
  chart: PieChart,
  book: BookOpen,
  calendar: CalendarDays,
  document: FileText,
  award: Award,
  compass: Compass,
}

/**
 * Solid signpost buttons, matching the college site's band of three.
 *
 * White on brand blue measures 10.66:1, so the label is comfortably readable
 * and the icon is decorative rather than load-bearing — every button says what
 * it is in words.
 */
export const QuickNavBlockView = ({ block }: { block: QuickNavBlock }) => {
  const items = block.items ?? []
  if (items.length === 0) return null

  return (
    <Section background={block.background as BlockBackground}>
      <SectionHeading
        heading={block.heading}
        accentWord={block.accentWord}
        level={block.headingLevel}
        className=""
      />

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const Icon = ICONS[item.icon ?? 'building'] ?? Building2
          return (
            <li key={item.id ?? index}>
              <CMSLink
                link={item.link}
                overrideClassName
                className="group flex min-h-16 items-center gap-4 rounded-2xl bg-brand px-5 py-4 text-white transition-colors hover:bg-brand-deep"
              >
                <span aria-hidden="true" className="shrink-0 text-white/85">
                  <Icon size={26} strokeWidth={1.5} />
                </span>

                <span className="min-w-0 flex-1 font-semibold">{item.label}</span>

                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-brand transition-transform group-hover:translate-x-1"
                >
                  <ChevronRight size={17} strokeWidth={2.5} />
                </span>
              </CMSLink>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
