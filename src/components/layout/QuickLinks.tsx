'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export interface QuickLink {
  label: string
  href: string
}

/**
 * The quick-links menu at the right of the header (SRS 5.24 / FR-QL-01).
 *
 * The SRS asks for "one-click access to the most-requested destinations,
 * independent of the primary menu", and is explicit that it complements the
 * menu rather than replacing it (FR-QL-05) — so the same destinations still
 * appear in their proper place under About, Admissions and the rest. This is a
 * shortcut, not a second information architecture.
 *
 * In the header rather than only on home pages, because the things a parent
 * arrives for — an admission form, the fee page, a term date — are wanted from
 * whatever page they happen to land on, and a panel that only exists on the
 * home page is the one place they are not.
 */
export const QuickLinks = ({ links }: { links: QuickLink[] }) => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const wrapRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      // Focus goes back to the control that opened the panel rather than being
      // dropped at the top of the document.
      buttonRef.current?.focus()
    }
    const onAway = (event: Event) => {
      if (wrapRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onAway)
    document.addEventListener('focusin', onAway)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onAway)
      document.removeEventListener('focusin', onAway)
    }
  }, [open])

  if (links.length === 0) return null

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="quick-links"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-pill border border-line px-3.5 py-2 text-sm font-semibold text-brand transition-colors hover:border-brand hover:text-brand-deep"
      >
        {/*
          The label is spelled out from `sm` up and reduced to the icon on the
          narrowest screens, where the header has to hold a crest, a menu
          toggle and the enquiry button as well.
        */}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="size-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        >
          <path d="M3 5h14M3 10h14M3 15h9" />
        </svg>
        <span className="hidden sm:inline">Quick links</span>
        <span className="sr-only sm:hidden">Quick links</span>
      </button>

      {open ? (
        <div
          id="quick-links"
          className="absolute right-0 top-full z-50 mt-2 min-w-60 rounded-xl border-t-4 border-accent bg-white py-2 shadow-raised"
        >
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block px-4 py-2.5 text-ink-soft transition-colors hover:bg-brand-tint hover:text-brand"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
