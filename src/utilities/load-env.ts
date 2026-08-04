import fs from 'fs'
import path from 'path'

/**
 * Loads `.env` for scripts run outside Next.js.
 *
 * Next injects environment variables for the app and the Payload CLI, but a
 * bare `tsx` process (seeds, maintenance tasks) gets nothing — so `getPayload`
 * fails on a missing secret. `process.loadEnvFile` is built into Node 20.12+,
 * so this needs no dependency.
 *
 * Values already present in the real environment always win, which is what CI
 * and production deployments rely on.
 */
export const loadEnv = (): void => {
  // Nothing to do when the environment is already populated.
  if (process.env.DATABASE_URI && process.env.PAYLOAD_SECRET) return

  const envPath = path.resolve(process.cwd(), '.env')

  if (!fs.existsSync(envPath)) {
    throw new Error(
      `No .env file found at ${envPath}. Copy .env.example to .env and fill in DATABASE_URI and PAYLOAD_SECRET.`,
    )
  }

  process.loadEnvFile(envPath)

  const missing = ['DATABASE_URI', 'PAYLOAD_SECRET'].filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`.env is missing required value(s): ${missing.join(', ')}`)
  }
}
