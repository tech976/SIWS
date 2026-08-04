import fs from 'fs'
import os from 'os'
import path from 'path'

import sharp from 'sharp'

import { loadEnv } from '@/utilities/load-env'

loadEnv()

const { getPayload } = await import('payload')
const { default: config } = await import('@payload-config')

/**
 * Uploads the Kindergarten photographs into the media library.
 *
 * Source images are the camera originals in `../assets/images` — several are
 * 6000×4000 and up to 19 MB, which is far past what any web page should serve
 * and past the upload ceiling in `Media.ts`. They are therefore resized here,
 * on the fly, rather than being committed to the repository in a pre-shrunk
 * form: the seed stays reproducible from the originals SIWS supplied, and no
 * binaries enter version control.
 *
 * Alt text was written by looking at each photograph, not inferred from the
 * filename. Describing an image you have not seen produces alt text that is
 * worse than none, because a screen-reader user cannot tell it is wrong.
 *
 * Run with:  npm run seed:media
 */

const SOURCE_DIR = path.resolve(process.cwd(), '../assets/images')
const MAX_WIDTH = 1800

interface ImageSeed {
  /** Filename in `assets/images`. */
  file: string
  /** Stable name in the media library — also how the page seed refers to it. */
  filename: string
  alt: string
  caption?: string
  /**
   * FR-PRV-11 — true where a student is identifiable. Verifiable parental
   * consent must be recorded before such an image is published.
   */
  depictsChildren: boolean
  /** Noted where the image does not look like SIWS's own photography. */
  needsLicenceCheck?: boolean
}

const IMAGES: ImageSeed[] = [
  {
    file: 'g1.jpeg',
    filename: 'kg-classroom-activity.jpg',
    alt: 'Kindergarten children in SIWS uniform sitting at curved group tables, colouring in activity books with crayons.',
    caption: 'Spacious, well-ventilated classrooms with group seating',
    depictsChildren: true,
  },
  {
    file: 'g2.jpeg',
    filename: 'kg-classroom-group.jpg',
    alt: 'A kindergarten class seated around a large curved table, smiling towards the camera.',
    caption: 'Small groups and plenty of room to move',
    depictsChildren: true,
  },
  {
    file: '12.JPG',
    filename: 'kg-classroom-seated.jpg',
    alt: 'Young children in SIWS uniform seated at classroom tables, listening to their teacher.',
    caption: 'Bright, child-height classroom furniture',
    depictsChildren: true,
  },
  {
    file: '3.JPG',
    filename: 'kg-play-area.jpg',
    alt: 'Kindergarten children in sports uniform standing in rows on the green artificial-turf play area during a physical activity session.',
    caption: 'Safe play and activity area',
    depictsChildren: true,
  },
  {
    file: 'i4.png',
    filename: 'kg-teacher-with-children.jpg',
    alt: 'A SIWS teacher surrounded by a group of kindergarten children hugging her on the school play area.',
    caption: 'Supportive and trained school staff',
    depictsChildren: true,
  },
  {
    file: 'ss.jpeg',
    filename: 'kg-children-together.jpg',
    alt: 'A close group of kindergarten girls in SIWS sports uniform with red headbands, arms around each other, smiling.',
    caption: 'Friendships that start in the earliest years',
    depictsChildren: true,
  },
  {
    file: '1.jpg',
    filename: 'kg-canteen-meal.jpg',
    alt: 'A young child at a dining table eating a school meal from a sectioned metal tray.',
    caption: 'Pure vegetarian canteen',
    depictsChildren: true,
    needsLicenceCheck: true,
  },
  {
    file: '6.jpeg',
    filename: 'kg-handwashing.jpg',
    alt: 'A school pupil washing their hands at an outdoor tap.',
    caption: 'Clean and hygienic washrooms',
    depictsChildren: true,
    needsLicenceCheck: true,
  },
]

const main = async () => {
  const payload = await getPayload({ config })

  const { docs: units } = await payload.find({
    collection: 'units',
    where: { slug: { equals: 'kindergarten' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const kg = units[0]
  if (!kg) throw new Error('Kindergarten unit not found. Run `npm run seed` first.')

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'siws-media-'))
  let created = 0
  let updated = 0
  const flagged: string[] = []

  try {
    for (const image of IMAGES) {
      const source = path.join(SOURCE_DIR, image.file)
      if (!fs.existsSync(source)) {
        payload.logger.warn(`Skipping ${image.file} — not found in ${SOURCE_DIR}`)
        continue
      }

      // `rotate()` with no argument applies the EXIF orientation, so portrait
      // photographs off a phone are not served on their side.
      const resized = path.join(workDir, image.filename)
      await sharp(source)
        .rotate()
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(resized)

      const existing = await payload.find({
        collection: 'media',
        where: { filename: { equals: image.filename } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })

      const data = {
        alt: image.alt,
        caption: image.caption,
        unit: kg.id,
        depictsChildren: image.depictsChildren,
      }

      if (existing.docs[0]) {
        await payload.update({
          collection: 'media',
          id: existing.docs[0].id,
          data: data as never,
          filePath: resized,
          overrideAccess: true,
        })
        updated += 1
        payload.logger.info(`Updated media: ${image.filename}`)
      } else {
        await payload.create({
          collection: 'media',
          data: data as never,
          filePath: resized,
          overrideAccess: true,
        })
        created += 1
        payload.logger.info(`Uploaded media: ${image.filename}`)
      }

      if (image.needsLicenceCheck) flagged.push(image.filename)
    }
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true })
  }

  payload.logger.info(`Media seed complete — ${created} uploaded, ${updated} updated.`)

  const childImages = IMAGES.filter((image) => image.depictsChildren).length
  payload.logger.warn(
    `${childImages} images are marked as showing identifiable students. Verifiable parental consent must be recorded for each before go-live.`,
  )

  if (flagged.length > 0) {
    payload.logger.warn(
      `These do not appear to be SIWS's own photography — please confirm the licence: ${flagged.join(', ')}`,
    )
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error('Media seed failed:', error)
    process.exit(1)
  })
