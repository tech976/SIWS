import { Images, Megaphone, Newspaper } from 'lucide-react'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { Payload, TypedUser } from 'payload'

/**
 * What a Head of Department sees when they sign in.
 *
 * The trustees' complaint was not that the panel lacked anything — it was that
 * "this will be too complex for our HODs". The general dashboard shows page
 * counts, a review queue and an enquiry inbox, none of which an HOD can act on,
 * and Payload's default shows every collection as an equal card. Both leave a
 * teacher hunting for the two things they came to do.
 *
 * So this is those two things, as large buttons, in the order they would be
 * used, under the department's own name so it is obvious whose site is being
 * edited.
 *
 * STYLES ARE INLINE, NOT TAILWIND. The admin panel is Payload's own SCSS build
 * and does not load the site's stylesheet — the first version used Tailwind
 * classes and rendered as a column of bare underlined links. The `--theme-*`
 * custom properties below are Payload's, so this follows the panel into dark
 * mode without a second palette.
 *
 * A Server Component, like the dashboard it replaces: the server props carrying
 * `payload` and `user` are not forwarded to client components.
 */

interface HodDashboardProps {
  payload: Payload
  user?: TypedUser | null
  /** Their department, already resolved by the caller. */
  unitName: string | null
}

const card: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1rem',
  padding: '1.5rem',
  borderRadius: '0.75rem',
  border: '1px solid var(--theme-elevation-150)',
  background: 'var(--theme-elevation-0)',
  textDecoration: 'none',
  color: 'inherit',
}

const cardTitle: CSSProperties = {
  display: 'block',
  fontSize: '1.15rem',
  fontWeight: 600,
  marginBottom: '0.35rem',
  color: 'var(--theme-text)',
}

const cardBody: CSSProperties = {
  display: 'block',
  color: 'var(--theme-elevation-600)',
  lineHeight: 1.5,
}

const sectionLabel: CSSProperties = {
  marginTop: '2.5rem',
  marginBottom: '1rem',
  fontSize: '0.8rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--theme-elevation-600)',
}

const quickLink: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: 'var(--theme-text)',
}

export const HodDashboard = async ({ payload, user, unitName }: HodDashboardProps) => {
  /** Counts scoped by the user's own access, so they only ever see their own. */
  const count = async (collection: 'posts' | 'announcements') => {
    try {
      const result = await payload.count({
        collection,
        overrideAccess: false,
        user: user ?? undefined,
      })
      return result.totalDocs
    } catch {
      return 0
    }
  }

  const [posts, announcements] = await Promise.all([count('posts'), count('announcements')])

  /*
   * The department leads, not the person. A seeded account is called "SIWS
   * Primary School — Head of Department", and greeting its first word produced
   * "Hello, SIWS". Naming the department is both more useful and impossible to
   * get wrong, however the account was named.
   */
  const heading = unitName ?? 'Your department'

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '50rem' }}>
      <h1 style={{ margin: 0 }}>{heading}</h1>
      <p style={{ marginTop: '0.5rem', color: 'var(--theme-elevation-600)', fontSize: '1.05rem' }}>
        Anything you publish here appears on your school&rsquo;s pages.
      </p>

      <h2 style={sectionLabel}>What would you like to do?</h2>

      <div style={{ display: 'grid', gap: '1rem' }}>
        <Link href="/admin/collections/posts/create" style={card}>
          <Newspaper size={28} strokeWidth={1.7} aria-hidden="true" style={{ flexShrink: 0 }} />
          <span>
            <span style={cardTitle}>Write about something that happened</span>
            <span style={cardBody}>
              A celebration, a competition, a trip. Add photographs and a video, and the page is
              made for you.
            </span>
          </span>
        </Link>

        <Link href="/admin/collections/announcements/create" style={card}>
          <Megaphone size={28} strokeWidth={1.7} aria-hidden="true" style={{ flexShrink: 0 }} />
          <span>
            <span style={cardTitle}>Put one line on the news ticker</span>
            <span style={cardBody}>
              A single sentence that scrolls across the top of the website.
            </span>
          </span>
        </Link>
      </div>

      <h2 style={sectionLabel}>Or look at what you have already</h2>

      <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap' }}>
        <Link href="/admin/collections/posts" style={quickLink}>
          <Newspaper size={17} aria-hidden="true" />
          {posts === 1 ? '1 write-up' : `${posts} write-ups`}
        </Link>
        <Link href="/admin/collections/announcements" style={quickLink}>
          <Megaphone size={17} aria-hidden="true" />
          {announcements === 1 ? '1 ticker line' : `${announcements} ticker lines`}
        </Link>
        <Link href="/admin/collections/media" style={quickLink}>
          <Images size={17} aria-hidden="true" />
          Photographs
        </Link>
      </div>

      <p
        style={{
          marginTop: '2.5rem',
          padding: '1.1rem 1.35rem',
          borderRadius: '0.75rem',
          background: 'var(--theme-elevation-50)',
          color: 'var(--theme-elevation-600)',
          lineHeight: 1.6,
        }}
      >
        Nothing goes on the website until you press <strong>Publish</strong>. Until then only you
        and the office can see it, so it is safe to save half-finished work and come back to it.
      </p>
    </div>
  )
}
