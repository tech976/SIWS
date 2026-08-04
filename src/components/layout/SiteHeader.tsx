import Image from 'next/image'
import Link from 'next/link'

import type { Unit } from '@/payload-types'

import { PrimaryNav, type NavItem } from './PrimaryNav'

interface SiteHeaderProps {
  /** The unit whose site is being viewed, or null on the main portal. */
  unit?: Unit | null
  navItems: NavItem[]
  /** The cream strip beneath the bar. */
  infoText?: string | null
  cta?: { label: string; href: string } | null
}

/**
 * The site header, transcribed from the approved landing page.
 *
 * Structure matches the template: a white bar carrying the menu, a cream
 * information strip beneath it, and the SIWS crest floating over both at the
 * left edge on desktop.
 */
export const SiteHeader = ({ unit, navItems, infoText, cta }: SiteHeaderProps) => {
  const home = unit?.slug ? `/${unit.slug}` : '/'
  const title = unit?.name ?? "South Indians' Welfare Society"

  return (
    <header className="relative z-40 bg-white">
      <div className="relative border-b border-line">
        <div className="siws-container flex items-center gap-6 py-3">
          {/*
            The crest overlaps both bars in the approved design. It keeps its
            place in the document order — first inside the banner — so the first
            thing a screen-reader user meets is still the link home.
          */}
          <Link
            href={home}
            className="relative z-50 -my-2 shrink-0 lg:absolute lg:left-5 lg:top-1"
            aria-label={`${title} — home`}
          >
            <Image
              src="/brand/logo.png"
              alt=""
              width={220}
              height={220}
              priority
              className="h-14 w-auto sm:h-16 lg:h-24"
            />
          </Link>

          {/* Reserves the width the absolutely-positioned crest occupies. */}
          <div aria-hidden="true" className="hidden lg:block lg:w-30" />

          <PrimaryNav items={navItems} cta={cta} />
        </div>
      </div>

      {infoText ? <p className="info-strip">{infoText}</p> : null}
    </header>
  )
}
