'use client'

import { useEffect, useState } from 'react'

/**
 * Visitor accessibility controls (SRS 4.4 — "reachable from the header or
 * footer of every page"; NFR Accessibility).
 *
 * The stylesheet has always supported these: `html[data-text-size='large']`
 * and `html[data-contrast='high']` scale the whole system and flip to a
 * high-contrast palette. What was missing was any way for a visitor to set
 * them — the feature was half-built, styled but unreachable.
 *
 * Text size scales the ROOT font size rather than body copy alone, so every
 * rem-based measurement grows together and the layout reflows instead of
 * overlapping — which is what happens when only the paragraphs are enlarged.
 *
 * The choice is written to the document element and to `localStorage`, and
 * re-applied before paint by the inline script in the layout, so a visitor who
 * has asked for large text never sees a flash of the default first.
 */

type TextSize = 'normal' | 'large' | 'x-large'

const STORAGE_TEXT = 'siws:text-size'
const STORAGE_CONTRAST = 'siws:contrast'

export const AccessibilityControls = () => {
  const [textSize, setTextSize] = useState<TextSize>('normal')
  const [highContrast, setHighContrast] = useState(false)

  // Adopt whatever the pre-paint script already applied, so the buttons show
  // the state the visitor is actually looking at.
  useEffect(() => {
    const root = document.documentElement
    const size = root.getAttribute('data-text-size')
    setTextSize(size === 'large' || size === 'x-large' ? size : 'normal')
    setHighContrast(root.getAttribute('data-contrast') === 'high')
  }, [])

  const applyTextSize = (next: TextSize) => {
    setTextSize(next)
    const root = document.documentElement
    if (next === 'normal') root.removeAttribute('data-text-size')
    else root.setAttribute('data-text-size', next)
    try {
      window.localStorage.setItem(STORAGE_TEXT, next)
    } catch {
      // Private browsing can refuse storage; the setting still applies for
      // this page view, which is better than failing outright.
    }
  }

  const applyContrast = (next: boolean) => {
    setHighContrast(next)
    const root = document.documentElement
    if (next) root.setAttribute('data-contrast', 'high')
    else root.removeAttribute('data-contrast')
    try {
      window.localStorage.setItem(STORAGE_CONTRAST, next ? 'high' : 'normal')
    } catch {
      /* see above */
    }
  }

  const sizeButton = (value: TextSize, label: string, srLabel: string) => (
    <button
      key={value}
      type="button"
      onClick={() => applyTextSize(value)}
      aria-pressed={textSize === value}
      className={`min-h-11 min-w-11 rounded-lg border px-3 font-semibold transition-colors ${
        textSize === value
          ? 'border-accent bg-accent text-brand'
          : 'border-white/35 text-white hover:border-white'
      }`}
    >
      <span aria-hidden="true">{label}</span>
      <span className="sr-only">{srLabel}</span>
    </button>
  )

  return (
    <section aria-labelledby="a11y-heading" className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <h2 id="a11y-heading" className="text-sm font-semibold tracking-wide text-white uppercase">
        Accessibility
      </h2>

      <div className="flex items-center gap-2">
        <span className="text-sm text-white/75">Text size</span>
        {/*
          `aria-pressed` rather than a radio group: each button is a toggle a
          screen reader announces as pressed or not, which is what a visitor
          needs to hear to know the setting took effect.
        */}
        {sizeButton('normal', 'A', 'Normal text size')}
        {sizeButton('large', 'A+', 'Large text size')}
        {sizeButton('x-large', 'A++', 'Extra large text size')}
      </div>

      <button
        type="button"
        onClick={() => applyContrast(!highContrast)}
        aria-pressed={highContrast}
        className={`min-h-11 rounded-lg border px-4 text-sm font-semibold transition-colors ${
          highContrast
            ? 'border-accent bg-accent text-brand'
            : 'border-white/35 text-white hover:border-white'
        }`}
      >
        High contrast{highContrast ? ': on' : ''}
      </button>
    </section>
  )
}
