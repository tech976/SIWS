'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export interface NavItem {
  label: string
  href: string
}

interface PrimaryNavProps {
  items: NavItem[]
  cta?: { label: string; href: string } | null
}

/**
 * The primary menu and the header's right-hand cluster.
 *
 * The menu, the call-to-action and the mobile toggle live in one component
 * because they share a single row of flex ordering — splitting them left the
 * CTA and the hamburger each claiming the free space, which pushed them apart
 * at tablet widths.
 *
 * This is the only client component in the header; the rest of the shell
 * renders on the server.
 */
export const PrimaryNav = ({ items, cta }: PrimaryNavProps) => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // A route change must close the panel, or it stays open over the new page.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      // Focus returns to the control that opened the panel; without this the
      // keyboard user is silently dropped at the top of the document.
      toggleRef.current?.focus()
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const linkClass = (extra: string) =>
    `font-medium text-purple transition-colors hover:text-purple-deep aria-[current=page]:underline aria-[current=page]:decoration-yellow-deep aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8 ${extra}`

  return (
    <>
      {items.length > 0 ? (
        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(item.href) ? 'page' : undefined}
              className={linkClass('')}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}

      <div className="ml-auto flex shrink-0 items-center gap-3">
        {cta ? (
          <Link href={cta.href} className="btn-primary hidden text-sm sm:inline-flex">
            {cta.label}
          </Link>
        ) : null}

        {items.length > 0 ? (
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid size-11 place-items-center rounded-lg border border-purple lg:hidden"
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <span aria-hidden="true" className="relative block h-4 w-5">
              <span
                className={`absolute left-0 block h-0.5 w-5 bg-purple transition-transform duration-200 ${
                  open ? 'top-1/2 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 bg-purple transition-opacity duration-200 ${
                  open ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-5 bg-purple transition-transform duration-200 ${
                  open ? 'top-1/2 -rotate-45' : 'bottom-0'
                }`}
              />
            </span>
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          id="mobile-menu"
          ref={panelRef}
          className="absolute inset-x-0 top-full z-50 border-t border-line bg-white shadow-raised lg:hidden"
        >
          <nav aria-label="Main" className="siws-container flex flex-col py-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent(item.href) ? 'page' : undefined}
                className={linkClass(
                  'block border-b border-line py-3.5 last:border-b-0',
                )}
              >
                {item.label}
              </Link>
            ))}

            {/* The CTA is hidden on the narrowest screens, so it is repeated
                here rather than being unreachable on a phone. */}
            {cta ? (
              <Link href={cta.href} className="btn-primary my-4 sm:hidden">
                {cta.label}
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </>
  )
}
