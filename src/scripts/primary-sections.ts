import { loadEnv } from '@/utilities/load-env'

loadEnv()

const { getPayload } = await import('payload')
const { default: config } = await import('@payload-config')

/**
 * Gives two Primary sections a real layout.
 *
 * "A caring, inclusive and stimulating school" and "Safe, Secure & Disciplined
 * Campus" were both plain prose blocks — one a centred statement, the other a
 * heading over a column of text. Two paragraph blocks in a row, one after the
 * other, is where a page stops being designed and starts being a document.
 *
 * They become picture-and-text bands instead, alternating left and right, which
 * is the pattern the rest of the site already uses for a claim that needs
 * evidence beside it.
 *
 * THE PHOTOGRAPHS WERE CHOSEN AGAINST THE COPY, not for decoration:
 *   - the caring section gets a teacher at her desk with her class gathered
 *     round her, which is what "caring and inclusive" looks like;
 *   - the safety section gets a supervised whole-school yoga session, rows of
 *     children with staff watching — "disciplined practices and vigilant
 *     supervision" in a single frame.
 *
 * Nothing is rewritten: the wording, the heading and the accent word are
 * carried across untouched.
 *
 * Run with:  npx tsx src/scripts/primary-sections.ts
 */

const PAGE_ID = 11

const PLAN: Record<string, { file: string; position: 'left' | 'right' }> = {
  'A caring, inclusive and stimulating school': {
    file: 'primary-wadala-classrooms-and-campus-images-3.jpg',
    position: 'left',
  },
  'Safe, Secure & Disciplined Campus': {
    file: 'primary-matunga-classroom-and-campus-images-1.jpg',
    position: 'right',
  },
}

/**
 * Removes `id` at every level.
 *
 * Rewriting a page's blocks re-sends each row with the id it currently holds,
 * and Payload rejects the document once the order no longer matches — nested
 * arrays carry their own ids too. Stripping them makes the write a clean
 * replacement.
 */
const stripIds = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stripIds)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === 'id') continue
      out[k] = stripIds(v)
    }
    return out
  }
  return value
}

const run = async () => {
  const payload = await getPayload({ config })

  const page = await payload.findByID({
    collection: 'pages',
    id: PAGE_ID,
    depth: 0,
    overrideAccess: true,
  })

  const layout = (page.layout ?? []) as unknown as Record<string, unknown>[]
  let converted = 0

  const next = await Promise.all(
    layout.map(async (block) => {
      if (block.blockType !== 'richText') return block
      const plan = PLAN[String(block.heading ?? '')]
      if (!plan) return block

      const { docs } = await payload.find({
        collection: 'media',
        where: { filename: { equals: plan.file } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const image = docs[0]
      if (!image) {
        payload.logger.warn(`${plan.file} is not in the media library — left as prose.`)
        return block
      }

      converted += 1
      return {
        blockType: 'mediaText',
        heading: block.heading,
        accentWord: block.accentWord,
        headingLevel: block.headingLevel ?? 'h2',
        background: block.background ?? 'white',
        image: image.id,
        imagePosition: plan.position,
        imageShape: 'rounded',
        content: block.content,
      }
    }),
  )

  await payload.update({
    collection: 'pages',
    id: PAGE_ID,
    data: {
      // Passed back unchanged: `payload.update` replaces the document, and
      // omitting these resets status and strips the page from the menu.
      _status: page._status ?? 'published',
      slug: page.slug,
      unit: page.unit,
      showInNav: page.showInNav ?? false,
      navOrder: page.navOrder ?? 100,
      ...(page.navParent ? { navParent: page.navParent } : {}),
      layout: stripIds(next),
    } as never,
    overrideAccess: true,
  })

  payload.logger.info(`${converted} Primary section(s) converted to picture-and-text bands.`)
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
