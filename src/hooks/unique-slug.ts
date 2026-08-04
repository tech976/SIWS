import type { CollectionBeforeValidateHook, CollectionSlug, Where } from 'payload'
import { APIError } from 'payload'

import { toId } from '@/access'

/**
 * Enforces that a slug is unique *within its unit* rather than globally.
 *
 * A database-level `unique` on the column would be wrong here: every unit
 * legitimately needs its own `/admissions`, `/contact` and `/faq`, and a global
 * constraint would let whichever unit published first claim the slug for the
 * whole institution.
 *
 * Institution-wide documents (no unit) form their own namespace, so `/about` on
 * the main portal cannot collide with `/about` under Kindergarten either.
 *
 * Note this is a check-then-write, so two simultaneous saves of the same slug
 * could in principle both pass. That is acceptable for a CMS with a handful of
 * concurrent editors, and the failure mode is a duplicate slug flagged on the
 * next save rather than data loss.
 */
export const ensureUniqueSlugPerUnit =
  (collection: CollectionSlug): CollectionBeforeValidateHook =>
  async ({ data, originalDoc, req }) => {
    if (!data) return data

    const slug = (data as { slug?: unknown }).slug ?? (originalDoc as { slug?: unknown })?.slug
    if (typeof slug !== 'string' || slug.length === 0) return data

    // `data.unit` is absent on a partial update, in which case the existing
    // value still applies.
    const unitValue =
      'unit' in (data as object) ? (data as { unit?: unknown }).unit : (originalDoc as { unit?: unknown })?.unit
    const unitId = toId(unitValue as never)

    const clauses: Where[] = [
      { slug: { equals: slug } },
      unitId === null ? { unit: { exists: false } } : { unit: { equals: unitId } },
    ]

    const currentId = (originalDoc as { id?: unknown })?.id
    if (currentId !== undefined && currentId !== null) {
      clauses.push({ id: { not_equals: currentId } })
    }

    const { totalDocs } = await req.payload.count({
      collection,
      where: { and: clauses },
      overrideAccess: true,
    })

    if (totalDocs > 0) {
      throw new APIError(
        unitId === null
          ? `Another institution-wide page already uses the address "/${slug}". Choose a different slug.`
          : `Another page in this unit already uses the address "/${slug}". Choose a different slug.`,
        409,
      )
    }

    return data
  }
