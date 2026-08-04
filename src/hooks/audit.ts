import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterOperationHook,
  PayloadRequest,
} from 'payload'

/**
 * BR-LOG-01 / BR-LOG-02 — writes the audit trail.
 *
 * One factory, attached per collection, so a new collection is covered by
 * adding two lines to its config rather than reimplementing the bookkeeping.
 *
 * What deliberately is NOT logged:
 *
 *  - Server-side scripts (seeds, migrations, verification runs). They carry no
 *    `req.user`, and logging them would bury the human actions the SRS cares
 *    about under thousands of "System" lines. The requirement is "user, action
 *    and timestamp" — actions with no user are configuration, not activity.
 *
 *  - The audit collection itself. Its config carries no hooks, so a log write
 *    can never cascade into another log write.
 *
 * A failed audit write is reported loudly in the server log but does not roll
 * back the change it was recording: refusing a teacher's save because the log
 * table hiccuped would punish the person who did nothing wrong. The tests in
 * `verify-audit.ts` exist to catch the systematic failures that actually matter.
 */

/** Best-effort display title, across every collection we audit. */
const titleOf = (doc: Record<string, unknown> | null | undefined): string => {
  if (!doc) return ''
  for (const key of ['title', 'name', 'filename', 'childName', 'email']) {
    const value = doc[key]
    if (typeof value === 'string' && value.trim().length > 0) return value.trim()
  }
  return doc.id !== undefined ? `#${String(doc.id)}` : ''
}

interface WriteArgs {
  req: PayloadRequest
  action:
    | 'created'
    | 'updated'
    | 'published'
    | 'unpublished'
    | 'deleted'
    | 'viewed_personal_data'
    | 'exported_personal_data'
    | 'deleted_personal_data'
    | 'emergency_publish'
  targetCollection: string
  targetId?: unknown
  targetTitle?: string
  detail?: string
}

export const writeAuditLog = async ({
  req,
  action,
  targetCollection,
  targetId,
  targetTitle,
  detail,
}: WriteArgs): Promise<void> => {
  const user = req.user
  if (!user) return

  const actorName =
    typeof (user as { name?: unknown }).name === 'string'
      ? (user as { name: string }).name
      : user.email

  const verb: Record<WriteArgs['action'], string> = {
    created: 'created',
    updated: 'updated',
    published: 'published',
    unpublished: 'unpublished',
    deleted: 'deleted',
    viewed_personal_data: 'viewed personal data in',
    exported_personal_data: 'exported personal data from',
    deleted_personal_data: 'deleted personal data from',
    emergency_publish: 'emergency-published',
  }

  try {
    await req.payload.create({
      collection: 'audit-logs',
      overrideAccess: true,
      /**
       * DEADLOCK — `req` must be passed.
       *
       * Payload wraps each operation in a database transaction. Omitting `req`
       * here makes the audit insert open its *own* transaction, which then
       * waits for a lock the caller's still-open transaction holds — while that
       * caller waits for this hook to return. Postgres reports it exactly:
       * `insert into "audit_logs" … wait_event_type = Lock` against a session
       * that is `idle in transaction`. Every content save hung indefinitely.
       *
       * Passing `req` enrols the write in the caller's transaction instead. It
       * also makes the log honest: if the operation is rolled back, its audit
       * entry rolls back with it, so nothing is recorded that did not happen.
       */
      req,
      data: {
        summary: `${actorName} ${verb[action]} ${targetTitle || targetCollection}`,
        action,
        targetCollection,
        targetId: targetId !== undefined && targetId !== null ? String(targetId) : undefined,
        targetTitle,
        actor: user.id,
        actorEmail: user.email,
        detail,
      } as never,
    })
  } catch (error) {
    req.payload.logger.error(
      { err: error },
      `AUDIT WRITE FAILED for ${action} on ${targetCollection} — the change itself was saved.`,
    )
  }
}

/** BR-LOG-01 — content creates, updates and publish transitions. */
export const auditChange =
  (targetCollection: string): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, operation, req }) => {
    if (!req.user) return doc

    const next = (doc as { _status?: string })?._status
    const prev = (previousDoc as { _status?: string } | undefined)?._status

    let action: WriteArgs['action'] = operation === 'create' ? 'created' : 'updated'
    if (next === 'published' && prev !== 'published') action = 'published'
    else if (prev === 'published' && next !== undefined && next !== 'published') {
      action = 'unpublished'
    }

    await writeAuditLog({
      req,
      action,
      targetCollection,
      targetId: (doc as { id?: unknown }).id,
      targetTitle: titleOf(doc as Record<string, unknown>),
    })

    return doc
  }

/**
 * BR-LOG-01 / BR-DPA-05 — deletions. For collections holding personal data the
 * entry doubles as the "minimum evidence of the erasure itself" that BR-DPA-05
 * requires an erasure to leave behind.
 */
export const auditDelete =
  (targetCollection: string, holdsPersonalData = false): CollectionAfterDeleteHook =>
  async ({ doc, id, req }) => {
    if (!req.user) return doc

    await writeAuditLog({
      req,
      action: holdsPersonalData ? 'deleted_personal_data' : 'deleted',
      targetCollection,
      targetId: id,
      // For personal data the title itself is personal data, so the log keeps
      // only the record ID — enough to evidence the erasure without undoing it.
      targetTitle: holdsPersonalData ? undefined : titleOf(doc as Record<string, unknown>),
    })

    return doc
  }

/**
 * BR-LOG-02 — "access to personal data". One entry per read *operation* (a
 * list view or a single record), not one per row, so the log records who looked
 * without drowning in duplicates.
 */
export const auditPersonalDataReads =
  (targetCollection: string): CollectionAfterOperationHook =>
  async ({ operation, req, result }) => {
    if (!req.user) return result
    if (operation !== 'find' && operation !== 'findByID') return result
    // The export endpoint reads the same collection but logs itself as an
    // export instead — without this flag every export would log twice.
    if (req.context?.skipAudit === true) return result

    const count =
      operation === 'find'
        ? ((result as { docs?: unknown[] })?.docs?.length ?? 0)
        : 1

    // An empty list view reveals nothing, so it is not an access event.
    if (count === 0) return result

    await writeAuditLog({
      req,
      action: 'viewed_personal_data',
      targetCollection,
      detail: `${count} record${count === 1 ? '' : 's'} returned`,
    })

    return result
  }
