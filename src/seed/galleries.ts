import { loadEnv } from '@/utilities/load-env'

loadEnv()

const { getPayload } = await import('payload')
const { default: config } = await import('@payload-config')
const { richText } = await import('./lexical')

/**
 * Builds a gallery page for every section, plus one institution-wide.
 *
 * Contents come from the media library rather than being listed here, so the
 * page is a view of what the school has actually uploaded. Re-run it after
 * `npm run photos:import` and the new pictures appear.
 *
 * WHICH PHOTOGRAPHS APPEAR
 * ------------------------
 * A section's gallery shows images tagged to that section, plus untagged ones
 * (which are shared across all four). The institution-wide gallery shows only
 * untagged images — a picture of a Kindergarten classroom does not belong on
 * the group's front-door gallery unless someone says it does.
 *
 * WHAT IS LEFT OUT, AND WHY IT IS NOT A BUG
 * -----------------------------------------
 * Photographs of identifiable students without a completed permission record
 * are excluded. They stay in the library — staff need to see what they have —
 * but a gallery is a published page, and FR-PRV-11 forbids publishing them.
 * Including them would simply make the page unpublishable: the consent hook
 * rejects the save. Each run reports how many were held back.
 *
 * Withdrawn images are excluded too, wherever they are used (FR-SW-05).
 *
 * Run with:  npm run seed:galleries
 */

interface MediaDoc {
  id: number
  alt?: string | null
  caption?: string | null
  campus?: string | null
  category?: string | null
  unit?: number | null
  depictsChildren?: boolean | null
  parentalConsent?: { obtained?: boolean | null } | null
  withdrawn?: { isWithdrawn?: boolean | null } | null
}

const main = async () => {
  const payload = await getPayload({ config })

  const { docs: units } = await payload.find({
    collection: 'units',
    sort: 'order',
    limit: 20,
    depth: 0,
    overrideAccess: true,
  })

  const { docs } = await payload.find({
    collection: 'media',
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })

  const all = docs as unknown as MediaDoc[]

  /** Publishable: not withdrawn, and consented if a student is recognisable. */
  const publishable = all.filter((item) => {
    if (item.withdrawn?.isWithdrawn) return false
    if (item.depictsChildren && !item.parentalConsent?.obtained) return false
    return true
  })

  const heldBack = all.length - publishable.length

  const gallery = (item: MediaDoc) => ({
    image: item.id,
    // The library's caption if it has one; otherwise nothing. The alt text is
    // not reused as a caption — it is written for someone who cannot see the
    // picture, and reads oddly printed beside it.
    caption: item.caption || undefined,
  })

  const upsert = async (
    unitId: number | null,
    slug: string,
    title: string,
    intro: string,
    images: MediaDoc[],
  ) => {
    if (images.length === 0) {
      payload.logger.info(`Skipped ${title} — no publishable photographs yet.`)
      return
    }

    const page = {
      slug,
      title,
      intro,
      showInNav: true,
      navLabel: 'Gallery',
      navOrder: 45,
      _status: 'published',
      reviewStatus: 'approved',
      metaDescription: `${intro} ${images.length} photographs.`,
      unit: unitId ?? undefined,
      /**
       * One gallery block per category, in alphabetical order, with anything
       * uncategorised last. Schools sort photographs by occasion — Sports,
       * Festivals, Annual Day — and a single 70-image grid throws that away,
       * leaving a parent to scroll looking for the sports day.
       */
      layout: (() => {
        /**
         * Grouped by CAMPUS first, then category.
         *
         * The Primary Section runs at Wadala and Matunga and they are separate
         * schools to a parent — different head teacher, different roster,
         * different house rules. Merging their photographs into one grid would
         * show a family the wrong campus. The campus prefix is added only when
         * a unit actually has more than one, so single-campus sections read as
         * they did before.
         */
        const campuses = new Set(images.map((item) => (item.campus ?? '').trim()).filter(Boolean))
        const label: Record<string, string> = { wadala: 'Wadala', matunga: 'Matunga' }

        const groups = new Map<string, MediaDoc[]>()
        for (const item of images) {
          const cat = (item.category ?? '').trim() || 'Other photographs'
          const camp = (item.campus ?? '').trim()
          const key =
            campuses.size > 1 && camp ? `${label[camp] ?? camp} campus — ${cat}` : cat
          const bucket = groups.get(key)
          if (bucket) bucket.push(item)
          else groups.set(key, [item])
        }

        const named = [...groups.entries()]
          .filter(([key]) => key !== 'Other photographs')
          .sort(([a], [b]) => a.localeCompare(b))
        const rest = groups.get('Other photographs')
        const ordered = rest ? [...named, ['Other photographs', rest] as const] : named

        return ordered.map(([heading, group], index) => ({
          blockType: 'gallery',
          heading,
          headingLevel: 'h2',
          layout: 'grid',
          // Alternating so the groups read as separate sections.
          background: index % 2 === 0 ? 'white' : 'sea',
          ...(index === 0 ? { intro: richText([intro]) } : {}),
          images: group.map(gallery),
        }))
      })(),
    }

    const existing = await payload.find({
      collection: 'pages',
      where: {
        and: [
          { slug: { equals: slug } },
          unitId === null ? { unit: { exists: false } } : { unit: { equals: unitId } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      await payload.update({
        collection: 'pages',
        id: existing.docs[0].id,
        data: page as never,
        overrideAccess: true,
      })
      payload.logger.info(`Updated ${title} — ${images.length} photograph(s).`)
    } else {
      await payload.create({ collection: 'pages', data: page as never, overrideAccess: true })
      payload.logger.info(`Created ${title} — ${images.length} photograph(s).`)
    }
  }

  // Institution-wide: only photographs not tied to one section.
  const shared = publishable.filter((item) => !item.unit)
  await upsert(
    null,
    'gallery',
    'Gallery',
    'Photographs from across the SIWS Group of Institutions.',
    shared,
  )

  // Per section: its own photographs, plus the shared ones.
  for (const unit of units) {
    const own = publishable.filter((item) => item.unit === unit.id)
    await upsert(
      unit.id as number,
      'gallery',
      'Gallery',
      `Photographs from ${unit.name}.`,
      [...own, ...shared],
    )
  }

  /**
   * A gallery on each campus page too.
   *
   * Wadala and Matunga are separate schools to a parent, and a visitor on the
   * Matunga page should see Matunga's photographs there rather than be sent to
   * a combined gallery to find them.
   *
   * This APPENDS to the page rather than owning it: existing gallery blocks are
   * stripped and rebuilt, everything else in the layout is left alone. So
   * `seed:primary` can rewrite the campus content and this can refresh the
   * photographs, without either clobbering the other. Run order is content
   * first, galleries second.
   */
  const CAMPUS_PAGES: { slug: string; campus: string; label: string }[] = [
    { slug: 'wadala', campus: 'wadala', label: 'Wadala' },
    { slug: 'matunga', campus: 'matunga', label: 'Matunga' },
  ]

  for (const unit of units) {
    for (const entry of CAMPUS_PAGES) {
      const shots = publishable.filter(
        (item) => item.unit === unit.id && (item.campus ?? '') === entry.campus,
      )
      if (shots.length === 0) continue

      const { docs: pages } = await payload.find({
        collection: 'pages',
        where: { and: [{ slug: { equals: entry.slug } }, { unit: { equals: unit.id } }] },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const page = pages[0]
      if (!page) continue

      const kept = (page.layout ?? []).filter(
        (block: { blockType?: string }) => block.blockType !== 'gallery',
      )

      const byCategory = new Map<string, MediaDoc[]>()
      for (const item of shots) {
        const key = (item.category ?? '').trim() || 'Photographs'
        const bucket = byCategory.get(key)
        if (bucket) bucket.push(item)
        else byCategory.set(key, [item])
      }

      const galleryBlocks = [...byCategory.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([heading, group], index) => ({
          blockType: 'gallery',
          heading,
          headingLevel: 'h2',
          layout: 'grid',
          perPage: '12',
          background: index % 2 === 0 ? 'white' : 'sea',
          ...(index === 0
            ? { intro: richText([`Photographs from our ${entry.label} campus.`]) }
            : {}),
          images: group.map(gallery),
        }))

      await payload.update({
        collection: 'pages',
        id: page.id,
        data: { layout: [...kept, ...galleryBlocks] } as never,
        overrideAccess: true,
      })
      payload.logger.info(
        `${entry.label} campus page — ${shots.length} photograph(s) in ${galleryBlocks.length} group(s).`,
      )
    }
  }

  if (heldBack > 0) {
    payload.logger.warn(
      `${heldBack} photograph(s) were left out: either a student is recognisable and no permission record exists, or the image has been withdrawn. They stay in the media library. Complete the permission record and re-run this to include them.`,
    )
  }

  process.exit(0)
}

main().catch((error: unknown) => {
  const nested = (error as { data?: { errors?: unknown[] } })?.data?.errors
  if (Array.isArray(nested)) {
    console.error('Gallery seed failed. Field errors:')
    for (const item of nested) console.error('  •', JSON.stringify(item))
  } else {
    console.error('Gallery seed failed:', error)
  }
  process.exit(1)
})
