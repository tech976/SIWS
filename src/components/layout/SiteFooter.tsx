import Link from 'next/link'

import type { Unit } from '@/payload-types'

import type { NavItem } from './PrimaryNav'

interface SiteFooterProps {
  unit?: Unit | null
  /** Quick links for this scope. */
  quickLinks: NavItem[]
  /** All active units, for cross-navigation between sites. */
  units: Pick<Unit, 'id' | 'slug' | 'shortName'>[]
}

const SOCIAL_LABEL: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  x: 'X',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
}

/**
 * SRS 4.2 — the footer carried on every page.
 *
 * Statutory links (privacy, cookie policy, data protection, grievance contact)
 * are required here by FR-PRV-15. They are rendered only once their pages
 * exist, so the footer never ships a link to a 404 — the remaining slots appear
 * as those modules are built.
 */
export const SiteFooter = ({ unit, quickLinks, units }: SiteFooterProps) => {
  const year = new Date().getFullYear()
  const social = (unit?.socialProfiles ?? []).filter(
    (profile) => typeof profile.url === 'string' && profile.url.length > 0,
  )

  const addressLines = [
    unit?.addressLine1,
    unit?.addressLine2,
    [unit?.city, unit?.postalCode].filter(Boolean).join(' – '),
  ].filter((line): line is string => typeof line === 'string' && line.trim().length > 0)

  return (
    <footer className="mt-auto border-t-4 border-yellow bg-cream-soft">
      <div className="siws-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="text-lg">About SIWS</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            South Indians&rsquo; Welfare Society is a trusted educational institution in Wadala
            since 1934, committed to value-based, disciplined and structured learning.
          </p>
        </div>

        {quickLinks.length > 0 ? (
          <nav aria-labelledby="footer-quick-links">
            <h2 id="footer-quick-links" className="text-lg">
              Quick Links
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ink-soft underline-offset-4 hover:text-purple hover:underline"
                  >
                    <span aria-hidden="true">›</span> {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {units.length > 0 ? (
          <nav aria-labelledby="footer-units">
            <h2 id="footer-units" className="text-lg">
              Our Schools
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {units.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={`/${entry.slug}`}
                    aria-current={unit?.id === entry.id ? 'true' : undefined}
                    className="text-ink-soft underline-offset-4 hover:text-purple hover:underline aria-[current]:font-semibold aria-[current]:text-purple"
                  >
                    <span aria-hidden="true">›</span> {entry.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <div>
          <h2 className="text-lg">Contact Us</h2>
          <address className="mt-3 space-y-3 text-sm not-italic text-ink-muted">
            {addressLines.length > 0 ? (
              <p>
                {addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            ) : null}

            {unit?.email ? (
              <p>
                <a
                  href={`mailto:${unit.email}`}
                  className="underline-offset-4 hover:text-purple hover:underline"
                >
                  {unit.email}
                </a>
              </p>
            ) : null}

            {unit?.phone ? (
              <p>
                {/* Stripping spaces keeps the tel: target dialable. */}
                <a
                  href={`tel:${unit.phone.replace(/[^\d+]/g, '')}`}
                  className="underline-offset-4 hover:text-purple hover:underline"
                >
                  {unit.phone}
                </a>
              </p>
            ) : null}
          </address>

          {social.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-3">
              {social.map((profile) => (
                <li key={profile.id ?? profile.url}>
                  <a
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-purple px-3 py-1.5 text-xs font-semibold text-purple transition-colors hover:bg-purple hover:text-white"
                  >
                    {SOCIAL_LABEL[profile.platform] ?? profile.platform}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="siws-container flex flex-col gap-2 py-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} South Indians&rsquo; Welfare Society (SIWS). All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
