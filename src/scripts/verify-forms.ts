import { loadEnv } from '@/utilities/load-env'

loadEnv()

const { getPayload } = await import('payload')
const { default: config } = await import('@payload-config')
const { createFormToken, guardSubmission } = await import('@/lib/form-guard')
const { ADMISSION_ENQUIRY_NOTICE } = await import('@/lib/consent-notices')

/**
 * Integration checks for the public enquiry form.
 *
 * These cover the two things that would be most damaging to get wrong and least
 * visible in testing: a spam gate that silently lets everything through, and
 * personal data that turns out to be publicly readable.
 *
 * Run with:  npm run verify:forms
 */

let passed = 0
let failed = 0

const check = async (name: string, run: () => Promise<void> | void): Promise<void> => {
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
  const createdIds: number[] = []

  console.log('\nPublic forms — spam protection & personal data\n')

  // -- Spam protection ----------------------------------------------------
  // A unique rate key per case, so one case's hits cannot trip another's limit.
  const key = (suffix: string) => `verify-${suffix}-${Date.now()}`

  await check('A genuine submission passes the guard', () => {
    const result = guardSubmission({
      // Backdated past the minimum fill time, which a real person always is.
      token: createFormToken(Date.now() - 10_000),
      honeypot: '',
      rateKey: key('ok'),
    })
    assert(result.ok, `Expected pass, got failure: ${result.failure}`)
  })

  await check('A filled honeypot is rejected', () => {
    const result = guardSubmission({
      token: createFormToken(Date.now() - 10_000),
      honeypot: 'http://spam.example.com',
      rateKey: key('honeypot'),
    })
    assert(!result.ok && result.failure === 'honeypot', 'Honeypot submission was accepted.')
  })

  await check('An instant submission is rejected as too fast', () => {
    const result = guardSubmission({
      token: createFormToken(Date.now()),
      honeypot: '',
      rateKey: key('fast'),
    })
    assert(!result.ok && result.failure === 'too_fast', 'A zero-second submission was accepted.')
  })

  await check('A forged token is rejected', () => {
    const result = guardSubmission({
      // Correct shape, wrong signature — the exact bypass attempt the HMAC
      // exists to stop.
      token: `${Date.now() - 10_000}.not-a-real-signature`,
      honeypot: '',
      rateKey: key('forged'),
    })
    assert(!result.ok && result.failure === 'bad_token', 'A forged token was accepted.')
  })

  await check('A tampered timestamp is rejected', () => {
    const genuine = createFormToken(Date.now())
    const signature = genuine.slice(genuine.lastIndexOf('.') + 1)
    // Keep the real signature but backdate the payload to fake a slow fill.
    const result = guardSubmission({
      token: `${Date.now() - 60_000}.${signature}`,
      honeypot: '',
      rateKey: key('tampered'),
    })
    assert(!result.ok && result.failure === 'bad_token', 'A tampered timestamp was accepted.')
  })

  await check('A stale token is rejected', () => {
    const result = guardSubmission({
      token: createFormToken(Date.now() - 4 * 60 * 60 * 1000),
      honeypot: '',
      rateKey: key('stale'),
    })
    assert(
      !result.ok && result.failure === 'expired_token',
      'A four-hour-old token was accepted.',
    )
  })

  await check('Repeated submissions are rate limited', () => {
    const shared = key('rate')
    let limited = false
    // The limit is 5 per window; the 6th must fail.
    for (let i = 0; i < 6; i += 1) {
      const result = guardSubmission({
        token: createFormToken(Date.now() - 10_000),
        honeypot: '',
        rateKey: shared,
      })
      if (!result.ok && result.failure === 'rate_limited') limited = true
    }
    assert(limited, 'Six submissions from one address were all accepted.')
  })

  // -- Personal data protection -------------------------------------------
  const { docs: units } = await payload.find({
    collection: 'units',
    where: { slug: { equals: 'kindergarten' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const kg = units[0]
  assert(Boolean(kg), 'Kindergarten unit missing — run `npm run seed` first.')

  const enquiry = await payload.create({
    collection: 'enquiries',
    overrideAccess: true,
    data: {
      unit: kg!.id,
      parentFirstName: 'Verify',
      parentLastName: 'Parent',
      childName: 'Verify Child',
      childAge: 4,
      phone: '+91 90000 00000',
      email: 'verify.parent@siws.test',
      gradeApplyingFor: 'Jr KG',
      status: 'new',
      consentGiven: true,
      consentPurpose: ADMISSION_ENQUIRY_NOTICE.purpose,
      consentNoticeVersion: ADMISSION_ENQUIRY_NOTICE.version,
      consentAt: new Date().toISOString(),
      consentSource: 'verification script',
    } as never,
  })
  createdIds.push(enquiry.id as number)

  try {
    await check('An anonymous visitor CANNOT read enquiries', async () => {
      const result = await payload
        .find({ collection: 'enquiries', overrideAccess: false, limit: 50 })
        .catch(() => ({ docs: [] as unknown[] }))
      assert(
        result.docs.length === 0,
        `Personal data was returned to the public (${result.docs.length} records).`,
      )
    })

    await check('The public API CANNOT create an enquiry directly', () =>
      expectRejection(
        () =>
          payload.create({
            collection: 'enquiries',
            overrideAccess: false,
            data: {
              unit: kg!.id,
              parentFirstName: 'Bot',
              parentLastName: 'Bot',
              childName: 'Bot',
              phone: '+910000000000',
              gradeApplyingFor: 'Jr KG',
              consentGiven: true,
            } as never,
          }),
        'REST create must be closed so bots cannot bypass the spam and consent checks',
      ),
    )

    await check('The consent record is stored with the enquiry', async () => {
      const stored = await payload.findByID({
        collection: 'enquiries',
        id: enquiry.id,
        overrideAccess: true,
        depth: 0,
      })
      assert(stored.consentGiven === true, 'Consent flag was not stored.')
      assert(
        stored.consentNoticeVersion === ADMISSION_ENQUIRY_NOTICE.version,
        'The notice version was not recorded, so a past consent could not be evidenced.',
      )
      assert(typeof stored.consentAt === 'string', 'The consent timestamp was not recorded.')
    })

    await check('No IP address is stored on the record', async () => {
      const stored = await payload.findByID({
        collection: 'enquiries',
        id: enquiry.id,
        overrideAccess: true,
        depth: 0,
      })
      const serialised = JSON.stringify(stored)
      // Data minimisation: an IP would be the one field here not needed to
      // answer the enquiry.
      assert(
        !/\b\d{1,3}(\.\d{1,3}){3}\b/.test(serialised),
        'Something resembling an IP address was stored on the enquiry.',
      )
    })

    await check('A targeted anonymous query returns no personal data', async () => {
      /**
       * `readPersonalData` returns `false` rather than a filter for an
       * unauthenticated caller, so Payload raises Forbidden instead of quietly
       * returning an empty page. That is the stronger outcome — a refusal
       * cannot be defeated by a malformed filter — so either behaviour passes,
       * and only actually receiving records is a failure.
       */
      let leaked = 0
      try {
        const result = await payload.find({
          collection: 'enquiries',
          overrideAccess: false,
          where: { childName: { contains: 'Verify' } },
        })
        leaked = result.docs.length
      } catch {
        leaked = 0
      }
      assert(leaked === 0, `An anonymous query returned ${leaked} personal records.`)
    })
  } finally {
    for (const id of createdIds) {
      await payload
        .delete({ collection: 'enquiries', id, overrideAccess: true })
        .catch(() => undefined)
    }
  }

  // -- Campus (two-location sections) -------------------------------------
  /**
   * The Primary Section runs at Wadala and Matunga, so an enquiry carries the
   * campus the family asked about. On the multi-campus form that value comes
   * from a visible select, and on a single-campus page from a hidden input —
   * neither of which is trustworthy, because anything can post to the Server
   * Action. Two guarantees are checked: the field rejects a value it does not
   * recognise, and the action validates rather than echoing what it was sent.
   */
  await check('An unrecognised campus is refused', () =>
    expectRejection(
      () =>
        payload.create({
          collection: 'enquiries',
          overrideAccess: true,
          data: {
            unit: kg!.id,
            campus: 'shivaji-park',
            parentFirstName: 'Verify',
            parentLastName: 'Parent',
            childName: 'Verify Child',
            phone: '+91 90000 00000',
            gradeApplyingFor: 'Jr KG',
            status: 'new',
            consentGiven: true,
            consentPurpose: ADMISSION_ENQUIRY_NOTICE.purpose,
            consentNoticeVersion: ADMISSION_ENQUIRY_NOTICE.version,
            consentAt: new Date().toISOString(),
          } as never,
        }),
      'a campus outside the known list must not be stored against a family’s record',
    ),
  )

  await check('The enquiry action validates campus against the known list', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'src/app/(frontend)/actions/enquiry.ts'),
      'utf8',
    )

    assert(
      source.includes('CAMPUS_VALUES.includes'),
      'The enquiry action does not check the submitted campus against CAMPUS_VALUES.',
    )
    assert(
      !/campus:\s*values\.campus/.test(source),
      'The enquiry action stores the raw submitted campus instead of the validated value.',
    )
  })

  // -- Regression guard on the public query layer -------------------------
  /**
   * Payload's Local API defaults to `overrideAccess: true`, the opposite of the
   * REST default. A single `payload.find()` in `lib/site.ts` written without
   * `overrideAccess: false` silently bypasses collection access and serves
   * draft pages to anonymous visitors — which is exactly what happened once
   * already, and produced no error, no warning and a 200 response.
   *
   * A static check is used rather than a runtime one because the failure is
   * invisible at runtime: the page renders perfectly, it is just showing
   * content nobody was supposed to see.
   */
  await check('Every public query in lib/site.ts enforces access control', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'src/lib/site.ts'),
      'utf8',
    )

    const finds = source.split(/payload\.find\(\{/).slice(1)
    assert(finds.length > 0, 'No payload.find calls found — has the file moved?')

    const offenders: number[] = []
    finds.forEach((fragment, index) => {
      // Each call's own argument object ends at the first `})` that closes it.
      const body = fragment.slice(0, fragment.indexOf('})'))
      const guarded =
        body.includes('overrideAccess: false') || body.includes('...common')
      if (!guarded) offenders.push(index + 1)
    })

    assert(
      offenders.length === 0,
      `payload.find call(s) #${offenders.join(', ')} in lib/site.ts omit \`overrideAccess: false\` and will bypass access control.`,
    )
  })

  console.log(`\n${passed} passed, ${failed} failed\n`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((error: unknown) => {
  console.error('Verification could not run:', error)
  process.exit(1)
})
