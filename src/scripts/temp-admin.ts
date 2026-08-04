import { loadEnv } from '@/utilities/load-env'

loadEnv()

const { getPayload } = await import('payload')
const { default: config } = await import('@payload-config')

/**
 * Creates or removes a throwaway administrator so the rendered admin panel can
 * be checked over HTTP without anyone's real password.
 *
 * Usage:  tsx src/scripts/temp-admin.ts create | delete
 */

const EMAIL = 'temp.render.check@siws.test'
const PASSWORD = 'Verdant-Lantern-4471!'

const main = async () => {
  const payload = await getPayload({ config })
  const action = process.argv[2]

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: EMAIL } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (action === 'delete') {
    for (const user of existing.docs) {
      await payload.delete({ collection: 'users', id: user.id, overrideAccess: true })
    }
    console.log('removed')
    process.exit(0)
  }

  if (existing.docs.length === 0) {
    await payload.create({
      collection: 'users',
      data: {
        name: 'Render Check',
        email: EMAIL,
        password: PASSWORD,
        roles: ['admin'],
      } as never,
      overrideAccess: true,
    })
  }

  console.log(`${EMAIL}|${PASSWORD}`)
  process.exit(0)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
