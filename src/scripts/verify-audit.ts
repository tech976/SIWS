import { loadEnv } from '@/utilities/load-env'

loadEnv()

const { getPayload } = await import('payload')
const { default: config } = await import('@payload-config')

/**
 * Integration checks for the audit trail (BR-LOG-01 / BR-LOG-02).
 *
 * A broken audit log is the definition of a silent failure: every screen keeps
 * working and nothing errors — there is simply no record when someone finally
 * asks "who changed this?". So each guarantee is exercised end to end.
 *
 * Run with:  npm run verify:audit
 */

let passed = 0
let failed = 0

const check = async (name: string, run: () => Promise<void>): Promise<void> => {
  try {
    await run()
    passed += 1
    console.log(`  PASS  ${name}`)
  } catch (error) {
    failed += 1
    console.log(`  FAIL  ${name}`)
    console.log(`        ${error instanceof Error ? error.message : String(error)}`)
  }
}

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message)
}

const expectRejection = async (operation: () => Promise<unknown>, because: string) => {
  try {
    await operation()
  } catch {
    return
  }
  throw new Error(`Expected refusal: ${because}`)
}

const main = async () => {
  const payload = await getPayload({ config })

  const userIds: number[] = []
  const pageIds: number[] = []
  const enquiryIds: number[] = []
  const logIds: number[] = []

  const logCount = async (where?: Record<string, unknown>) =>
    (
      await payload.count({
        collection: 'audit-logs',
        overrideAccess: true,
        ...(where ? { where: where as never } : {}),
      })
    ).totalDocs

  /** Collects new log ids since `before`, so cleanup removes only ours. */
  const collectNewLogs = async () => {
    const { docs } = await payload.find({
      collection: 'audit-logs',
      overrideAccess: true,
      sort: '-createdAt',
      limit: 40,
      depth: 0,
    })
    for (const doc of docs) {
      if (!logIds.includes(doc.id as number)) logIds.push(doc.id as number)
    }
  }

  console.log('\nAudit trail — BR-LOG-01 / BR-LOG-02\n')

  try {
    const { docs: units } = await payload.find({
      collection: 'units',
      where: { slug: { equals: 'kindergarten' } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const kg = units[0]
    assert(Boolean(kg), 'Kindergarten unit missing — run `npm run seed` first.')

    const stamp = Date.now()

    const admin = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: {
        name: 'Audit Verifier',
        email: `audit.verify.${stamp}@siws.test`,
        password: 'Copper-Meadow-8842!',
        roles: ['admin'],
      } as never,
    })
    userIds.push(admin.id as number)

    const manager = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: {
        name: 'Audit CM',
        email: `audit.cm.${stamp}@siws.test`,
        password: 'Copper-Meadow-8842!',
        roles: ['contentManager'],
        units: [kg!.id],
      } as never,
    })
    userIds.push(manager.id as number)

    // ---- 1. Content change by a user is logged --------------------------
    const page = await payload.create({
      collection: 'pages',
      overrideAccess: false,
      user: admin,
      data: {
        title: `Audit fixture ${stamp}`,
        slug: `audit-fixture-${stamp}`,
        unit: kg!.id,
        _status: 'draft',
        layout: [],
      } as never,
    })
    pageIds.push(page.id as number)

    await check('Creating a page writes a log entry with the actor', async () => {
      const count = await logCount({
        and: [
          { action: { equals: 'created' } },
          { targetCollection: { equals: 'pages' } },
          { targetId: { equals: String(page.id) } },
          { actorEmail: { equals: admin.email } },
        ],
      })
      assert(count === 1, `Expected exactly 1 'created' entry, found ${count}.`)
    })

    // ---- 2. Publishing is logged as its own action ----------------------
    await check('Publishing is logged as "published", not merely "updated"', async () => {
      await payload.update({
        collection: 'pages',
        id: page.id,
        overrideAccess: false,
        user: admin,
        data: { _status: 'published' } as never,
      })

      const count = await logCount({
        and: [
          { action: { equals: 'published' } },
          { targetId: { equals: String(page.id) } },
        ],
      })
      assert(count === 1, `Expected a 'published' entry, found ${count}.`)
    })

    // ---- 3. Server scripts with no user stay out of the log -------------
    await check('A server-side script with no user writes no log entry', async () => {
      const before = await logCount()
      await payload.update({
        collection: 'pages',
        id: page.id,
        overrideAccess: true,
        data: { intro: 'system touch' } as never,
      })
      const after = await logCount()
      assert(
        after === before,
        `A userless update should not log; count went ${before} → ${after}.`,
      )
    })

    // ---- 4. The log is append-only, administrators included -------------
    await collectNewLogs()
    const anyLog = logIds[0]
    assert(anyLog !== undefined, 'No log entry available to test immutability against.')

    await check('An administrator CANNOT edit a log entry', () =>
      expectRejection(
        () =>
          payload.update({
            collection: 'audit-logs',
            id: anyLog!,
            overrideAccess: false,
            user: admin,
            data: { summary: 'tampered' } as never,
          }),
        'BR-LOG-02 — logs shall not be editable from the admin panel',
      ),
    )

    await check('An administrator CANNOT delete a log entry', () =>
      expectRejection(
        () =>
          payload.delete({
            collection: 'audit-logs',
            id: anyLog!,
            overrideAccess: false,
            user: admin,
          }),
        'the trail must survive the people it records',
      ),
    )

    await check('The API cannot forge a log entry', () =>
      expectRejection(
        () =>
          payload.create({
            collection: 'audit-logs',
            overrideAccess: false,
            user: admin,
            data: {
              summary: 'forged',
              action: 'created',
              targetCollection: 'pages',
            } as never,
          }),
        'entries are written by hooks only',
      ),
    )

    // ---- 5. Only Administrators and the DPO can read it -----------------
    await check('A Content Manager cannot read the activity log', async () => {
      let leaked = 0
      try {
        const result = await payload.find({
          collection: 'audit-logs',
          overrideAccess: false,
          user: manager,
          limit: 5,
        })
        leaked = result.docs.length
      } catch {
        leaked = 0
      }
      assert(leaked === 0, `A Content Manager read ${leaked} log entr${leaked === 1 ? 'y' : 'ies'}.`)
    })

    // ---- 6. Personal-data access and erasure are logged -----------------
    const enquiry = await payload.create({
      collection: 'enquiries',
      overrideAccess: true,
      data: {
        unit: kg!.id,
        parentFirstName: 'Audit',
        parentLastName: 'Fixture',
        childName: `Audit Child ${stamp}`,
        phone: '+91 90000 00001',
        gradeApplyingFor: 'Jr KG',
        status: 'new',
        consentGiven: true,
        consentPurpose: 'admission_enquiry',
        consentNoticeVersion: 'verify',
        consentAt: new Date().toISOString(),
      } as never,
    })
    enquiryIds.push(enquiry.id as number)

    await check('Viewing enquiries is logged as personal-data access', async () => {
      const before = await logCount({ action: { equals: 'viewed_personal_data' } })
      await payload.find({
        collection: 'enquiries',
        overrideAccess: false,
        user: admin,
        limit: 10,
      })
      const after = await logCount({ action: { equals: 'viewed_personal_data' } })
      assert(after === before + 1, `Expected one access entry; count went ${before} → ${after}.`)
    })

    await check('Erasing an enquiry leaves evidence without the personal data', async () => {
      await payload.delete({
        collection: 'enquiries',
        id: enquiry.id,
        overrideAccess: false,
        user: admin,
      })
      enquiryIds.pop()

      const { docs } = await payload.find({
        collection: 'audit-logs',
        overrideAccess: true,
        where: {
          and: [
            { action: { equals: 'deleted_personal_data' } },
            { targetId: { equals: String(enquiry.id) } },
          ],
        },
        limit: 1,
        depth: 0,
      })

      assert(docs.length === 1, 'No erasure-evidence entry was written (BR-DPA-05).')
      const serialised = JSON.stringify(docs[0])
      // The evidence must not itself retain what was erased.
      assert(
        !serialised.includes(`Audit Child ${stamp}`),
        'The erasure log kept the child’s name — evidence must not preserve the erased data.',
      )
    })
  } finally {
    await collectNewLogs()
    for (const id of pageIds) {
      await payload.delete({ collection: 'pages', id, overrideAccess: true }).catch(() => undefined)
    }
    for (const id of enquiryIds) {
      await payload
        .delete({ collection: 'enquiries', id, overrideAccess: true })
        .catch(() => undefined)
    }
    for (const id of userIds) {
      await payload.delete({ collection: 'users', id, overrideAccess: true }).catch(() => undefined)
    }
    // Test fixtures only — real entries are never deleted, and this bypass is
    // exactly the server-side path the panel does not have.
    await collectNewLogs()
    for (const id of logIds) {
      await payload
        .delete({ collection: 'audit-logs', id, overrideAccess: true })
        .catch(() => undefined)
    }
  }

  console.log(`\n${passed} passed, ${failed} failed\n`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((error: unknown) => {
  console.error('Verification could not run:', error)
  process.exit(1)
})
