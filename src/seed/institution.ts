import { loadEnv } from '@/utilities/load-env'

loadEnv()

const { getPayload } = await import('payload')
const { default: config } = await import('@payload-config')
const { richText } = await import('./lexical')

/**
 * Seeds the main SIWS portal with the content SIWS supplied
 * (SIWS School Website Content.pdf).
 *
 * Everything here is the school's own wording, placed verbatim — the tagline,
 * institution overview, history, vision, mission and core values. Nothing has
 * been invented or embellished; where the document is silent, the page simply
 * does not cover that ground.
 *
 * These are ordinary institution-wide pages (no unit), so the front page is now
 * editable by staff like any other. It used to be hard-coded in the route, which
 * meant the single page most likely to need updating was the only one nobody
 * could change.
 *
 * Run with:  npm run seed:institution
 */

const TAGLINE = 'From KG to PG — Inspiring Excellence Since 1934'

/** SRS 4.1 — institution overview, verbatim from the supplied content. */
const OVERVIEW = [
  "South Indians' Welfare Society (SIWS) is one of Mumbai's most respected educational institutions, serving the community with distinction since 1934. Founded with the vision of making quality education accessible to all, SIWS has grown into a comprehensive educational ecosystem that nurtures students from Kindergarten to Postgraduate education.",
  'The SIWS educational group comprises Kindergarten, Primary School, Secondary School, Junior College and Degree College, providing a seamless learning journey under one trusted institution. While firmly rooted in Indian values, SIWS embraces innovation, technology, and modern teaching methodologies to prepare students for a rapidly evolving world.',
  'For nearly a century, SIWS has remained committed to academic excellence, character building, discipline and holistic development. Thousands of students who began their educational journey at SIWS have gone on to become successful professionals, entrepreneurs, academicians and responsible citizens across the world.',
  'Today, SIWS continues to combine its rich heritage with forward-looking education, creating an environment where every learner is encouraged to discover their potential and contribute meaningfully to society.',
]

const HISTORY = [
  "South Indians' Welfare Society (SIWS) was established in 1934 with a modest primary school at Shivaji Park, Dadar, to serve the educational needs of Mumbai's South Indian community.",
  'Guided by a strong commitment to education and community service, SIWS gradually expanded to Matunga and Wadala, introducing Secondary School, Junior College and Degree College programmes. The subsequent addition of Commerce and Science streams, along with an autonomous degree college, reflected its continued pursuit of academic excellence.',
  'Today, SIWS is one of the few educational institutions in Maharashtra offering a complete educational journey — from Kindergarten to Postgraduate studies — within a single institutional family. As it approaches its centenary, SIWS continues to honour its rich legacy while embracing innovation, technology, and global educational standards.',
]

const VISION =
  'To be a leading educational institution that nurtures knowledge, character, innovation, and lifelong learning, empowering every student to become a responsible global citizen and a catalyst for positive societal change.'

const MISSION: { title: string }[] = [
  { title: 'To provide holistic, inclusive, and value-based education in a safe and nurturing environment.' },
  { title: 'To inspire academic excellence through innovative teaching and continuous learning.' },
  { title: 'To develop character, integrity, leadership, and social responsibility among students.' },
  { title: 'To foster creativity, critical thinking, scientific temper, and digital readiness.' },
  { title: 'To empower every learner with the knowledge, skills, and confidence needed to succeed in an ever-changing world.' },
  { title: 'To preserve our rich educational heritage while embracing emerging technologies and global best practices.' },
]

const CORE_VALUES = [
  { title: 'Integrity', description: 'We uphold honesty, ethics and accountability in all that we do.' },
  { title: 'Excellence', description: 'We encourage every learner to strive for their highest potential.' },
  { title: 'Respect', description: 'We value diversity, empathy and mutual respect.' },
  { title: 'Innovation', description: 'We embrace creativity, technology and continuous improvement.' },
  { title: 'Service', description: 'We believe education should inspire meaningful contributions to society.' },
  { title: 'Lifelong Learning', description: 'We cultivate curiosity and a passion for continuous growth.' },
]

const main = async () => {
  const payload = await getPayload({ config })

  /** Upserts an institution-wide page, matched by slug with no unit. */
  const upsert = async (page: Record<string, unknown> & { slug: string; title: string }) => {
    const existing = await payload.find({
      collection: 'pages',
      // Institution-wide pages carry no unit; `exists: false` is what
      // distinguishes them from a unit page that happens to share the slug.
      where: { and: [{ slug: { equals: page.slug } }, { unit: { exists: false } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      const doc = await payload.update({
        collection: 'pages',
        id: existing.docs[0].id,
        data: page as never,
        overrideAccess: true,
      })
      payload.logger.info(`Updated: ${page.title}`)
      return doc
    }

    const doc = await payload.create({
      collection: 'pages',
      data: page as never,
      overrideAccess: true,
    })
    payload.logger.info(`Created: ${page.title}`)
    return doc
  }

  const coreValuesSection = (background: string) => ({
    blockType: 'featureList',
    heading: 'Our Core Values',
    accentWord: 'Core Values',
    headingLevel: 'h2',
    marker: 'tick',
    columns: '2',
    background,
    items: CORE_VALUES,
  })

  const schoolsSection = (intro: string) => ({
    blockType: 'unitLinks',
    heading: 'Our Schools',
    accentWord: 'Schools',
    headingLevel: 'h2',
    background: 'white',
    intro: richText([intro]),
  })

  // -------------------------------------------------------------------- ABOUT
  // Seeded first, because the home page's hero links to it and an internal link
  // needs its target to exist before it can be referenced.
  const about = await upsert({
    slug: 'about',
    title: 'About SIWS',
    intro: TAGLINE,
    showInNav: true,
    navLabel: 'About SIWS',
    navOrder: 10,
    _status: 'published',
    reviewStatus: 'approved',
    metaDescription:
      "The story of South Indians' Welfare Society — founded in 1934 at Shivaji Park, Dadar, and now offering education from Kindergarten to Postgraduate studies.",
    layout: [
      {
        blockType: 'richText',
        heading: 'Our History',
        accentWord: 'History',
        headingLevel: 'h2',
        width: 'normal',
        background: 'white',
        content: richText(HISTORY),
      },
      {
        blockType: 'richText',
        heading: 'Our Vision',
        accentWord: 'Vision',
        headingLevel: 'h2',
        width: 'narrow',
        background: 'purple',
        content: richText([VISION]),
      },
      {
        blockType: 'featureList',
        heading: 'Our Mission',
        accentWord: 'Mission',
        headingLevel: 'h2',
        marker: 'tick',
        columns: '1',
        background: 'white',
        items: MISSION,
      },
      coreValuesSection('cream'),
      schoolsSection('Explore each school in the SIWS family.'),
    ],
  })

  // --------------------------------------------------------------- PORTAL HOME
  await upsert({
    slug: 'home',
    title: "South Indians' Welfare Society",
    _status: 'published',
    reviewStatus: 'approved',
    metaTitle: "South Indians' Welfare Society (SIWS), Mumbai",
    metaDescription:
      'From KG to PG — inspiring excellence since 1934. SIWS offers a complete educational journey from Kindergarten to Postgraduate studies in Mumbai.',
    layout: [
      {
        blockType: 'hero',
        eyebrow: 'Since 1934',
        title: TAGLINE,
        accentWord: 'Inspiring Excellence',
        intro:
          "South Indians' Welfare Society is one of Mumbai's most respected educational institutions, nurturing students from Kindergarten to Postgraduate education.",
        background: 'purple',
        links: [
          {
            link: {
              label: 'Read our story',
              type: 'internal',
              appearance: 'primary',
              // Polymorphic relationships store `{ relationTo, value }`.
              reference: { relationTo: 'pages', value: about.id },
            },
          },
        ],
      },
      schoolsSection('A seamless learning journey under one trusted institution.'),
      {
        blockType: 'richText',
        heading: "About South Indians' Welfare Society",
        accentWord: 'Welfare Society',
        headingLevel: 'h2',
        width: 'normal',
        background: 'cream',
        content: richText(OVERVIEW),
      },
      {
        blockType: 'statistics',
        heading: 'A legacy parents trust',
        background: 'white',
        stats: [
          { value: '1934', label: 'Serving Mumbai since' },
          { value: '90+', label: 'Years of educational legacy' },
          { value: 'KG–PG', label: 'A complete educational journey' },
        ],
      },
      coreValuesSection('tint'),
    ],
  })

  payload.logger.info('Institution content seeded.')
  payload.logger.warn(
    'NOTE: the supplied content names a Degree College as part of the SIWS group. It is described in the text but has no unit website, since the SRS scopes this project to four units.',
  )
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error('Institution seed failed:', error)
    process.exit(1)
  })
