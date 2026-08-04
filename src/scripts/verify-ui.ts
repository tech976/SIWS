import fs from 'fs'
import path from 'path'

/**
 * Static checks on the admin panel's styling.
 *
 * These three failure modes are all invisible in a browser unless you happen to
 * look at the exact element affected:
 *
 *  - a `var(--x)` with no definition resolves to nothing, so the property is
 *    simply dropped and the element renders unstyled;
 *  - a class emitted by a component but never styled looks like a layout bug
 *    somewhere else entirely;
 *  - a colour pairing that fails contrast looks perfectly fine to anyone with
 *    typical vision.
 *
 * None of them throw, none appear in the build output, and none would be caught
 * by a typecheck — hence a test. It needs no database and no server.
 *
 * Run with:  npm run verify:ui
 */

const STYLES_DIR = path.resolve(process.cwd(), 'src/app/(payload)/styles')
const CUSTOM_SCSS = path.resolve(process.cwd(), 'src/app/(payload)/custom.scss')
const ADMIN_COMPONENTS = path.resolve(process.cwd(), 'src/components/admin')

let passed = 0
let failed = 0

const check = (name: string, run: () => void): void => {
  try {
    run()
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

const readStyles = (): { file: string; source: string }[] => {
  const files = fs
    .readdirSync(STYLES_DIR)
    .filter((name) => name.endsWith('.scss'))
    .map((name) => path.join(STYLES_DIR, name))

  if (fs.existsSync(CUSTOM_SCSS)) files.push(CUSTOM_SCSS)

  return files.map((file) => ({
    file: path.basename(file),
    source: fs.readFileSync(file, 'utf8'),
  }))
}

// ---------------------------------------------------------------------------
// Contrast
// ---------------------------------------------------------------------------

const luminance = (hex: string): number => {
  const clean = hex.replace('#', '')
  const channels = [0, 2, 4].map((offset) => {
    const value = parseInt(clean.slice(offset, offset + 2), 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!
}

const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}

/** Reads a hex custom property out of the token file. */
const token = (source: string, name: string): string => {
  const match = source.match(new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{6})`))
  if (!match?.[1]) throw new Error(`Token ${name} not found, or is not a 6-digit hex.`)
  return match[1]
}

const WHITE = '#ffffff'

const main = () => {
  const styles = readStyles()
  const tokensFile = styles.find((entry) => entry.file === '_tokens.scss')
  if (!tokensFile) throw new Error('_tokens.scss not found.')
  const t = tokensFile.source

  console.log('\nAdmin panel UI — tokens, classes and contrast\n')

  // -- 1. Every custom property referenced is defined --------------------
  check('Every project custom property is defined', () => {
    const defined = new Set<string>()
    const used = new Map<string, string>()

    for (const { file, source } of styles) {
      for (const match of source.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)) {
        defined.add(match[1]!)
      }
      for (const match of source.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
        if (!used.has(match[1]!)) used.set(match[1]!, file)
      }
    }

    // Payload defines its own variables inside its package.
    const payloadOwned =
      /^--(theme|color|style|font|base|nav|btn|breakpoint|accessibility|z|doc|app|gutter|spacing|scrollbar|card|pill|popup)/

    const missing = [...used.entries()].filter(
      ([name]) => !defined.has(name) && !payloadOwned.test(name),
    )

    assert(
      missing.length === 0,
      `Undefined custom propert${missing.length === 1 ? 'y' : 'ies'}: ${missing
        .map(([name, file]) => `${name} (${file})`)
        .join(', ')}`,
    )
  })

  // -- 2. Every class a component emits has styling ----------------------
  check('Every class the admin components emit is styled', () => {
    const emitted = new Set<string>()

    for (const name of fs.readdirSync(ADMIN_COMPONENTS)) {
      if (!name.endsWith('.tsx')) continue
      const source = fs.readFileSync(path.join(ADMIN_COMPONENTS, name), 'utf8')

      for (const match of source.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
        const raw = (match[1] ?? match[2] ?? '')
          // Drop `${...}` interpolations; the dynamic values are covered by the
          // modifier check below rather than guessed at here.
          .replace(/\$\{[^}]*\}/g, ' ')
        for (const cls of raw.split(/\s+/)) {
          if (cls.startsWith('siws-') && !cls.endsWith('--') && !cls.endsWith('__')) {
            emitted.add(cls)
          }
        }
      }
    }

    const allStyles = styles.map((entry) => entry.source).join('\n')
    const styled = new Set<string>()
    let currentBlock: string | null = null

    for (const line of allStyles.split('\n')) {
      const top = line.match(/^\.(siws-[a-z0-9_-]+)/)
      if (top) {
        currentBlock = top[1]!
        styled.add(top[1]!)
      }
      const nested = line.match(/^\s+\.(siws-[a-z0-9_-]+)/)
      if (nested) styled.add(nested[1]!)
      const bem = line.match(/^\s+&(__[a-z0-9-]+|--[a-z0-9-]+)/)
      if (bem && currentBlock) styled.add(currentBlock + bem[1]!)
    }

    const orphans = [...emitted].filter((cls) => !styled.has(cls))
    assert(orphans.length === 0, `Classes used but never styled: ${orphans.join(', ')}`)
  })

  // -- 3. Icon chips ------------------------------------------------------
  check('Icon chips clear 4.5:1 against white glyphs', () => {
    const chips = ['--chip-purple', '--chip-blue', '--chip-teal', '--chip-coral', '--chip-amber']
    const weak = chips
      .map((name) => ({ name, ratio: contrast(WHITE, token(t, name)) }))
      /**
       * 4.5 rather than the 3:1 that SC 1.4.11 requires of a bare icon: these
       * chips are a place a count or label may later be dropped, and the margin
       * costs nothing. One chip previously sat at exactly 3.00:1.
       */
      .filter((entry) => entry.ratio < 4.5)

    assert(
      weak.length === 0,
      weak.map((entry) => `${entry.name} is ${entry.ratio.toFixed(2)}:1`).join(', '),
    )
  })

  // -- 4. Badges carry small text ----------------------------------------
  check('Status and delta badges clear 4.5:1 for small text', () => {
    const pairs: [string, string, string][] = [
      ['positive', '--siws-pos-ink', '--siws-pos-bg'],
      ['negative', '--siws-neg-ink', '--siws-neg-bg'],
      ['warning', '--siws-warn-ink', '--siws-warn-bg'],
    ]

    const weak = pairs
      .map(([label, ink, bg]) => ({ label, ratio: contrast(token(t, ink), token(t, bg)) }))
      .filter((entry) => entry.ratio < 4.5)

    assert(
      weak.length === 0,
      weak.map((entry) => `${entry.label} is ${entry.ratio.toFixed(2)}:1`).join(', '),
    )
  })

  // -- 5. Body text -------------------------------------------------------
  check('Body and muted text clear 4.5:1 on card and canvas', () => {
    const card = token(t, '--siws-card')
    const canvas = token(t, '--siws-canvas')

    const cases: [string, string, string][] = [
      ['ink on card', '--siws-ink', card],
      ['ink-2 on card', '--siws-ink-2', card],
      ['ink-3 on card', '--siws-ink-3', card],
      ['ink-3 on canvas', '--siws-ink-3', canvas],
      ['purple on card', '--siws-purple', card],
    ]

    const weak = cases
      .map(([label, ink, bg]) => ({ label, ratio: contrast(token(t, ink), bg) }))
      .filter((entry) => entry.ratio < 4.5)

    assert(
      weak.length === 0,
      weak.map((entry) => `${entry.label} is ${entry.ratio.toFixed(2)}:1`).join(', '),
    )
  })

  // -- 6. Hook-initiated writes must join the caller's transaction ---------
  check('Audit writes enrol in the caller’s transaction', () => {
    /**
     * Payload wraps each operation in a transaction. A `payload.create` inside
     * a hook that omits `req` opens a second transaction, which then waits on a
     * lock the caller still holds — while the caller waits for the hook. Every
     * save hangs, with no error and no stack trace; the only evidence is a
     * `wait_event_type = Lock` row in `pg_stat_activity`.
     *
     * A static check, because a runtime one would itself hang.
     */
    const source = fs.readFileSync(path.resolve(process.cwd(), 'src/hooks/audit.ts'), 'utf8')

    const creates = source.split(/payload\.create\(\{/).slice(1)
    assert(creates.length > 0, 'No payload.create found in audit.ts — has it moved?')

    const offenders = creates.filter((fragment) => {
      const body = fragment.slice(0, fragment.indexOf('data:'))
      return !/(^|[\s,{])req\s*,/.test(body)
    })

    assert(
      offenders.length === 0,
      `${offenders.length} payload.create call(s) in audit.ts omit \`req\` and will deadlock.`,
    )
  })

  // -- 7. No !important ---------------------------------------------------
  check('The theme uses no !important', () => {
    /**
     * Payload ships its CSS inside `@layer payload-default`, and unlayered
     * author CSS outranks any layer. `!important` is therefore never needed —
     * and if one appears it is a sign a rule is fighting the cascade rather than
     * working with it, which is what makes Payload upgrades painful.
     */
    // Comments are stripped first — the rationale for *not* using `!important`
    // is itself written in a comment, which the naive check flagged.
    const stripComments = (source: string) =>
      source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '')

    const offenders = styles
      .filter((entry) => /!important/.test(stripComments(entry.source)))
      .map((entry) => entry.file)

    assert(offenders.length === 0, `!important found in: ${offenders.join(', ')}`)
  })

  console.log(`\n${passed} passed, ${failed} failed\n`)
  process.exit(failed > 0 ? 1 : 0)
}

try {
  main()
} catch (error) {
  console.error('Verification could not run:', error)
  process.exit(1)
}
