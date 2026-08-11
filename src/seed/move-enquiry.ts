import { loadEnv } from '@/utilities/load-env'

loadEnv()

const { getPayload } = await import('payload')
const { default: config } = await import('@payload-config')

/**
 * Moves each unit's admissions enquiry block off its home page and onto its
 * Admissions page.
 *
 * The block carries the whole enquiry apparatus — "Book a Free Campus Tour",
 * the form, the consent line and the trust points beneath it. On a home page
 * that asks a visitor to fill in their child's name and phone number before
 * the page has told them anything about the school. It belongs where someone
 * has already decided to enquire.
 *
 * The block is MOVED, not copied and not rebuilt: the same fields, the same
 * class list, the same consent wording. Nothing is retyped, so nothing can
 * drift from what the unit already published.
 *
 * Run with:  npm run seed:move-enquiry
 */

const run = async () => {
  const payload = await getPayload({ config })

  const { docs: units } = await payload.find({
    collection: 'units',
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })

  let moved = 0
  const notes: string[] = []

  /*
   * Strips `id` at EVERY level, not just the top.
   *
   * A heroEnquiry block owns nested arrays — the ticked benefits, the trust
   * points, the class and campus options — and each of those rows carries its
   * own id too. Removing only the block's own id still sends dozens of nested
   * ids that belong to rows on the page it came from, and Payload rejects the
   * whole document on the first one.
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

  const load = async (slug: string, unitId: number | string) => {
    const { docs } = await payload.find({
      collection: 'pages',
      where: { and: [{ slug: { equals: slug } }, { unit: { equals: unitId } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    return docs[0] ?? null
  }

  /** Everything a page needs passed back so an update does not reset it. */
  const carry = (page: Record<string, unknown>) => ({
    _status: page._status ?? 'published',
    slug: page.slug,
    unit: page.unit,
    showInNav: page.showInNav ?? false,
    navOrder: page.navOrder ?? 100,
    ...(page.navParent ? { navParent: page.navParent } : {}),
  })

  for (const unit of units) {
    const home = await load('home', unit.id)
    const admissions = await load('admissions', unit.id)
    if (!home) continue

    const homeLayout = [...((home.layout ?? []) as unknown as Record<string, unknown>[])]
    const enquiry = homeLayout.filter((b) => b.blockType === 'heroEnquiry')
    if (enquiry.length === 0) {
      notes.push(`${unit.slug}: no enquiry block on the home page`)
      continue
    }

    if (!admissions) {
      notes.push(`${unit.slug}: NO admissions page — enquiry block left where it is`)
      continue
    }

    const admLayout = [...((admissions.layout ?? []) as unknown as Record<string, unknown>[])]
    const alreadyThere = admLayout.some((b) => b.blockType === 'heroEnquiry')

    if (!alreadyThere) {
      /*
       * `id` is DELETED, not set to undefined. Payload validates the key's
       * presence, so `{ ...b, id: undefined }` still fails — the row arrives
       * claiming an id that belongs to a block on another page. Stripping it
       * outright is what makes these new rows on the receiving page.
       */
      const incoming = enquiry.map((b) => stripIds(b) as Record<string, unknown>)

      /*
       * After the banner if the page has one, so Admissions still opens with
       * its own heading rather than with a form.
       */
      const insertAt = admLayout.findIndex((b) => b.blockType === 'hero') + 1

      await payload.update({
        collection: 'pages',
        id: admissions.id,
        data: {
          ...carry(admissions as never),
          layout: [...admLayout.slice(0, insertAt), ...incoming, ...admLayout.slice(insertAt)],
        } as never,
        overrideAccess: true,
      })
    } else {
      notes.push(`${unit.slug}: admissions already had an enquiry block — not duplicated`)
    }

    await payload.update({
      collection: 'pages',
      id: home.id,
      data: {
        ...carry(home as never),
        layout: homeLayout.filter((b) => b.blockType !== 'heroEnquiry'),
      } as never,
      overrideAccess: true,
    })

    moved += 1
    payload.logger.info(`${unit.slug}: enquiry moved from home to admissions.`)
  }

  payload.logger.info(`${moved} unit(s) updated.`)
  for (const note of notes) payload.logger.warn(note)

  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
