import { loadEnv } from '@/utilities/load-env'

loadEnv()

const { getPayload } = await import('payload')
const { default: config } = await import('@payload-config')

/**
 * Builds the menu SIWS asked for, from the SRS functional-requirement modules
 * (5.2 – 5.23) and the common unit template in SRS 4.2.
 *
 * Two rules govern what this script will and will not do.
 *
 * It creates a page for every destination in the menu, because a menu item
 * that leads nowhere is worse than no menu item — and the menu is only useful
 * to SIWS if it shows the whole structure now.
 *
 * Each created page is published but EMPTY apart from a line saying what
 * belongs on it. Nothing is invented: the page states plainly that content is
 * still to come rather than inventing facts about a real school, which is a
 * risk that outlives any placeholder. Unpublish any of them in the admin panel
 * and they drop straight out of the menu.
 *
 * Pages that already exist are never overwritten — only their menu position is
 * set. That is why Academics, Admissions and the rest keep the content they
 * were seeded with.
 *
 * Depth is capped at two levels by `navParent` itself (BR-NAV-01/02).
 *
 * Run with:  npm run seed:nav
 */

/*
 * NOT in this menu: Alumni, Careers, Newsletter and Mandatory Documents.
 *
 * Those four slugs are reserved by `RESERVED_SLUGS` — the platform holds those
 * addresses for purpose-built features (SRS 5.16, 5.19, 5.14, 5.20), each of
 * which needs a registration form, an application flow with document upload,
 * a subscription endpoint or a statutory document list. An ordinary CMS page
 * cannot provide any of that, and one sitting at the address would block the
 * real feature from ever being routed there.
 *
 * This script created pages at those addresses in an earlier run. They could
 * never be saved from the admin panel — the slug validator rejects a reserved
 * word — so they were removed. They belong back in the menu when the features
 * behind them are built, not before.
 */
interface Entry {
  slug: string
  label: string
  /** The SRS module this destination comes from, for the placeholder note. */
  srs?: string
  children?: Entry[]
}

/** The portal menu — institution-wide destinations (SRS 4.1). */
const PORTAL: Entry[] = [
  {
    slug: 'about',
    label: 'About SIWS',
    children: [
      { slug: 'history', label: 'Our History' },
      { slug: 'vision-mission', label: 'Vision & Mission' },
      { slug: 'leadership', label: 'Leadership', srs: '4.1' },
      { slug: 'facilities', label: 'Facilities & Campus', srs: '5.10' },
    ],
  },
  {
    slug: 'admissions',
    label: 'Admissions',
    srs: '5.3',
    children: [
      { slug: 'scholarships', label: 'Scholarships' },
      { slug: 'admissions-faq', label: 'Admissions FAQ', srs: '5.17' },
    ],
  },
  {
    slug: 'updates',
    label: 'Updates',
    srs: '5.2',
    children: [
      { slug: 'news', label: 'News & Announcements', srs: '5.2' },
      { slug: 'events', label: 'Events', srs: '5.2' },
      { slug: 'achievements', label: 'Achievements', srs: '5.6' },
      { slug: 'gallery', label: 'Photo & Video Gallery', srs: '5.4' },
      { slug: 'annual-calendar', label: 'Annual Calendar', srs: '5.22' },
    ],
  },
  {
    slug: 'student-life',
    label: 'Student Life',
    srs: '5.5',
    children: [
      { slug: 'student-wall', label: 'Student Wall', srs: '5.5' },
      { slug: 'value-based-stories', label: 'Value-Based Stories', srs: '5.7' },
      { slug: 'transport', label: 'Transport & Bus Routes', srs: '5.11' },
    ],
  },
  {
    slug: 'community',
    label: 'Community',
    srs: '5.16',
    children: [
      { slug: 'parent-feedback', label: 'Parent Feedback', srs: '5.23' },
    ],
  },
  {
    slug: 'contact',
    label: 'Contact',
    srs: '5.13',
    children: [{ slug: 'download-centre', label: 'Download Centre', srs: '5.21' }],
  },
]

/** The common unit template (SRS 4.2), used by all four unit sites. */
const UNIT: Entry[] = [
  {
    slug: 'about',
    label: 'About',
    children: [
      { slug: 'facilities', label: 'Facilities & Campus', srs: '5.10' },
      { slug: 'gallery', label: 'Campus Gallery', srs: '5.4' },
    ],
  },
  {
    slug: 'academics',
    label: 'Academics',
    srs: '5.9',
    children: [
      { slug: 'teachers', label: 'Our Teachers', srs: '5.8' },
      { slug: 'annual-calendar', label: 'Annual Calendar', srs: '5.22' },
      { slug: 'school-rules', label: 'Rules & Uniform' },
    ],
  },
  {
    slug: 'admissions',
    label: 'Admissions',
    srs: '5.3',
    children: [{ slug: 'admissions-faq', label: 'Admissions FAQ', srs: '5.17' }],
  },
  {
    slug: 'updates',
    label: 'Updates',
    srs: '5.2',
    children: [
      { slug: 'news', label: 'News & Events', srs: '5.2' },
      { slug: 'achievements', label: 'Achievements', srs: '5.6' },
      { slug: 'download-centre', label: 'Download Centre', srs: '5.21' },
    ],
  },
  {
    slug: 'student-life',
    label: 'Student Life',
    srs: '5.5',
    children: [
      { slug: 'student-wall', label: 'Student Wall', srs: '5.5' },
      { slug: 'transport', label: 'Transport', srs: '5.11' },
    ],
  },
  { slug: 'faq', label: 'FAQ', srs: '5.17' },
  {
    slug: 'contact',
    label: 'Contact',
    srs: '5.13',
    children: [{ slug: 'parent-feedback', label: 'Parent Feedback', srs: '5.23' }],
  },
]

/*
 * What a VISITOR reads on a page whose content has not arrived.
 *
 * It deliberately says nothing about the project. The first version explained
 * that SIWS had not supplied content and quoted the SRS module number, which
 * is a note to the developer that was being published to parents — internal
 * spec references have no business on a school's public website. The note for
 * staff lives in the admin panel instead, where it belongs.
 */
const note = (_label: string, _srs?: string) =>
  'We are preparing this page. Please check back soon.'


const run = async () => {
  const payload = await getPayload({ config })

  const { docs: units } = await payload.find({ collection: 'units', limit: 50, depth: 0 })

  let created = 0
  let placed = 0

  const applyScope = async (scopeName: string, unitId: number | string | null, tree: Entry[]) => {
    const where = unitId === null ? { unit: { exists: false } } : { unit: { equals: unitId } }

    const { docs: existing } = await payload.find({
      collection: 'pages',
      where,
      limit: 200,
      depth: 0,
      draft: true,
      overrideAccess: true,
    })
    const idBySlug = new Map(existing.map((page) => [page.slug, page.id]))

    /** Creates the page as an unpublished draft if it is not there yet. */
    const ensure = async (entry: Entry) => {
      const found = idBySlug.get(entry.slug)
      if (found) return found

      const doc = await payload.create({
        collection: 'pages',
        data: {
          title: entry.label,
          slug: entry.slug,
          intro: note(entry.label, entry.srs),
          _status: 'published',
          ...(unitId === null ? {} : { unit: unitId }),
        } as never,
        overrideAccess: true,
      })
      idBySlug.set(entry.slug, doc.id)
      created += 1
      return doc.id
    }

    let order = 0
    for (const top of tree) {
      const topId = await ensure(top)
      order += 10
      await setNav(topId, order, null)
      placed += 1

      for (const child of top.children ?? []) {
        const childId = await ensure(child)
        order += 1
        await setNav(childId, order, topId)
        placed += 1
      }
    }

    payload.logger.info(
      `${scopeName}: ${tree.length} top-level, ${tree.reduce((n, t) => n + (t.children?.length ?? 0), 0)} in drop-downs.`,
    )
  }

  /*
   * The three menu columns are written directly.
   *
   * `payload.update` cannot do this job: with `draft: true` it writes a new
   * version and leaves the live row untouched, so the public menu would keep
   * its old shape; without it, it rewrites the whole document, re-running
   * validation over content this script never touched and resetting `_status`,
   * which silently unpublishes live pages. These three columns are the menu's
   * shape and nothing else.
   */
  const pool = (
    payload.db as unknown as {
      pool: { query: (text: string, values: unknown[]) => Promise<unknown> }
    }
  ).pool

  const setNav = (id: number | string, order: number, parent: number | string | null) =>
    pool.query(
      'UPDATE pages SET show_in_nav = TRUE, nav_order = $1, nav_parent_id = $2 WHERE id = $3',
      [order, parent, id],
    )

  await applyScope('(portal)', null, PORTAL)
  for (const unit of units) await applyScope(unit.slug, unit.id, UNIT)

  payload.logger.info(`Menu built — ${placed} items placed, ${created} placeholder pages created.`)
  payload.logger.warn(
    'Placeholder pages carry a "content to come" note and no sections. Add content, or unpublish any you do not want in the menu yet.',
  )

  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
