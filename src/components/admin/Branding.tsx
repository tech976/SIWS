/* eslint-disable @next/next/no-img-element */
import { ExternalLink, LifeBuoy } from 'lucide-react'

/**
 * SIWS branding for the admin panel.
 *
 * Plain `<img>` rather than `next/image`: these render inside Payload's own
 * layout, which does not provide the sizing context `next/image` needs, and the
 * crest is a small static asset already served from `/public`.
 *
 * `alt=""` throughout — adjacent text always names the institution, so
 * announcing the crest as well would just be repetition for a screen reader.
 */

/** Login screen (`graphics.Logo`). */
export const Logo = () => (
  <div style={{ display: 'grid', justifyItems: 'center', gap: '0.85rem' }}>
    <img src="/brand/logo.png" alt="" width={96} height={96} style={{ height: 84, width: 'auto' }} />
    <span
      style={{
        color: '#241d38',
        fontSize: '1.05rem',
        fontWeight: 700,
        letterSpacing: '-0.015em',
        textAlign: 'center',
      }}
    >
      South Indians&rsquo; Welfare Society
    </span>
  </div>
)

/** Breadcrumb "home" affordance (`graphics.Icon`). */
export const Icon = () => (
  <img
    src="/brand/logo.png"
    alt=""
    width={32}
    height={32}
    style={{ height: 26, width: 'auto', display: 'block' }}
  />
)

/** Brand block at the top of the nav rail (`beforeNavLinks`). */
export const NavBrand = () => (
  <div className="siws-brand">
    <span className="siws-brand__mark">
      <img src="/brand/logo.png" alt="" width={30} height={30} />
    </span>
    <span className="siws-brand__text">
      <span className="siws-brand__name">SIWS</span>
      <span className="siws-brand__sub">Content manager</span>
    </span>
  </div>
)

/**
 * Help card at the foot of the sidebar (`afterNavLinks`), matching the
 * "Help Center" card position in the reference designs.
 *
 * A plain anchor, not `next/link`: the public site is a separate route group
 * with its own layout, so a client-side transition would be wasted work.
 */
export const NavFooterCard = () => (
  <div className="siws-navcard">
    <span className="siws-navcard__icon" aria-hidden="true">
      <LifeBuoy size={20} strokeWidth={2} />
    </span>
    <p className="siws-navcard__title">Need a hand?</p>
    <p className="siws-navcard__text">See how your changes look to visitors.</p>
    <a className="siws-navcard__btn" href="/" target="_blank" rel="noopener noreferrer">
      View the website
      <ExternalLink size={14} strokeWidth={2.5} aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  </div>
)

/** Welcome copy above the login form (`beforeLogin`). */
export const LoginIntro = () => (
  <div className="siws-login-intro">
    <h1>Content manager</h1>
    <p>Sign in to add, edit and publish content for your unit.</p>
  </div>
)
