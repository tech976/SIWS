/**
 * Render every un-described photograph in the manifest as a small JPEG in a
 * scratch directory, so the ones the reader cannot open directly — HEIC, and
 * the third of SIWS's files that arrived with no extension at all — can still
 * be looked at before their alt text is written.
 *
 *   npx tsx src/scripts/preview-photos.ts <out-dir> [category]
 *
 * The output filename is the manifest's `file` value with slashes replaced, so
 * a preview always maps back to exactly one manifest row.
 */
import fs from 'node:fs'
import path from 'node:path'

import sharp from 'sharp'

const INBOX = path.resolve(process.cwd(), 'photos-inbox')
const MANIFEST = path.join(INBOX, 'manifest.csv')
/** Wide enough to read a blackboard, small enough to look at many at once. */
const PREVIEW_WIDTH = 1100

const [outDir, categoryFilter] = process.argv.slice(2)
if (!outDir) {
  console.error('Usage: preview-photos <out-dir> [category]')
  process.exit(1)
}

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i += 1
        } else quoted = false
      } else cell += char
      continue
    }
    if (char === '"') quoted = true
    else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (char !== '\r') cell += char
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((entry) => entry.some((value) => value.trim().length > 0))
}

/** Same HEIC detour as the importer — sharp's prebuilt binary has no HEVC decoder. */
const render = async (source: string): Promise<Buffer> => {
  const pipeline = async (input: Buffer | string, raw?: sharp.CreateRaw) =>
    sharp(input as never, raw ? { raw } : undefined)
      .rotate()
      .resize({ width: PREVIEW_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
      .toBuffer()

  try {
    return await pipeline(source)
  } catch {
    const { default: decode } = await import('heic-decode')
    const { width, height, data } = await decode({ buffer: fs.readFileSync(source) })
    return pipeline(Buffer.from(data), { width, height, channels: 4 })
  }
}

const run = async () => {
  const rows = parseCsv(fs.readFileSync(MANIFEST, 'utf8'))
  const header = rows[0]
  const iFile = header.indexOf('file')
  const iCategory = header.indexOf('category')
  const iAlt = header.indexOf('alt')

  fs.mkdirSync(outDir, { recursive: true })

  const pending = rows
    .slice(1)
    .filter((row) => row[iAlt].trim().length === 0)
    .filter((row) => !categoryFilter || row[iCategory] === categoryFilter)

  let done = 0
  const failed: string[] = []

  for (const row of pending) {
    const file = row[iFile]
    const source = path.join(INBOX, file)
    const target = path.join(outDir, `${file.replace(/[\\/]/g, '__')}.jpg`)
    if (fs.existsSync(target)) {
      done += 1
      continue
    }
    try {
      fs.writeFileSync(target, await render(source))
      done += 1
    } catch (error) {
      failed.push(`${file} — ${(error as Error).message}`)
    }
  }

  console.log(`Rendered ${done} preview(s) into ${outDir}.`)
  if (failed.length) console.log(`\nCould not render:\n  ${failed.join('\n  ')}`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
