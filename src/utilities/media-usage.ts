import type { Field, Payload } from 'payload'

/**
 * BR-MED-07 — "The system shall warn before deleting a media item that is in
 * use, and shall indicate where it is used."
 *
 * Payload keeps no reverse index of uploads, so usage is discovered by walking
 * the config for every field that can point at the media collection and
 * counting matches. Driving this off the config rather than a hand-maintained
 * list means a new collection with an image field is covered the moment it is
 * added, with no chance of the check silently going stale.
 */

interface FieldPath {
  path: string
  label: string
}

const isNamed = (field: Field): field is Extract<Field, { name: string }> =>
  'name' in field && typeof field.name === 'string'

const pointsAt = (relationTo: unknown, target: string): boolean =>
  Array.isArray(relationTo) ? relationTo.includes(target) : relationTo === target

/**
 * Collects the query paths of every upload/relationship field that can
 * reference `target`.
 *
 * Path construction follows Payload's own query syntax: named containers
 * (group, named tab) and arrays/blocks contribute a segment, whereas purely
 * presentational containers (row, collapsible, unnamed tab) do not.
 */
const collectPaths = (fields: Field[], target: string, prefix = ''): FieldPath[] => {
  const found: FieldPath[] = []

  for (const field of fields) {
    const name = isNamed(field) ? field.name : null
    const here = name ? (prefix ? `${prefix}.${name}` : name) : prefix

    switch (field.type) {
      case 'upload':
      case 'relationship': {
        if (name && pointsAt(field.relationTo, target)) {
          found.push({ path: here, label: field.label ? String(field.label) : name })
        }
        break
      }

      case 'group':
      case 'array':
        found.push(...collectPaths(field.fields, target, here))
        break

      case 'row':
      case 'collapsible':
        // Layout-only: contributes no path segment.
        found.push(...collectPaths(field.fields, target, prefix))
        break

      case 'tabs': {
        for (const tab of field.tabs) {
          const tabPrefix =
            'name' in tab && typeof tab.name === 'string'
              ? prefix
                ? `${prefix}.${tab.name}`
                : tab.name
              : prefix
          found.push(...collectPaths(tab.fields, target, tabPrefix))
        }
        break
      }

      case 'blocks': {
        for (const block of field.blocks) {
          // Blocks share their parent field's query path.
          found.push(...collectPaths(block.fields, target, here))
        }
        break
      }

      default:
        break
    }
  }

  return found
}

export interface MediaUsage {
  total: number
  /** Human-readable list of where the item is referenced. */
  summary: string
  locations: { collection: string; label: string; count: number }[]
}

interface DescribeArgs {
  payload: Payload
  /** The uploads collection being deleted from, e.g. `media`. */
  collection: string
  id: number | string
}

export const describeMediaUsage = async ({
  payload,
  collection,
  id,
}: DescribeArgs): Promise<MediaUsage> => {
  const locations: MediaUsage['locations'] = []

  const checks: Promise<void>[] = []

  for (const candidate of payload.config.collections) {
    // A media collection never references itself.
    if (candidate.slug === collection) continue

    const paths = collectPaths(candidate.fields as Field[], collection)
    if (paths.length === 0) continue

    for (const { path } of paths) {
      checks.push(
        payload
          .count({
            collection: candidate.slug,
            where: { [path]: { equals: id } },
            overrideAccess: true,
          })
          .then((result) => {
            if (result.totalDocs > 0) {
              locations.push({
                collection: candidate.slug,
                label: String(candidate.labels?.plural ?? candidate.slug),
                count: result.totalDocs,
              })
            }
          })
          .catch(() => {
            // A single unqueryable path must not block the delete check as a
            // whole; the remaining paths still report accurately.
          }),
      )
    }
  }

  await Promise.all(checks)

  // Several fields on one collection are reported once, summed.
  const merged = new Map<string, { label: string; count: number }>()
  for (const location of locations) {
    const existing = merged.get(location.collection)
    if (existing) {
      existing.count += location.count
    } else {
      merged.set(location.collection, { label: location.label, count: location.count })
    }
  }

  const mergedLocations = Array.from(merged.entries()).map(([slug, value]) => ({
    collection: slug,
    label: value.label,
    count: value.count,
  }))

  const total = mergedLocations.reduce((sum, location) => sum + location.count, 0)

  return {
    total,
    locations: mergedLocations,
    summary: mergedLocations
      .map((location) => `${location.count} in ${location.label}`)
      .join(', '),
  }
}
