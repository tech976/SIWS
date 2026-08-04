/**
 * BR-MED-05 — "Uploaded files shall be validated by actual content type rather
 * than by file extension alone."
 *
 * A browser-supplied MIME type is attacker-controlled, so Payload's `mimeTypes`
 * whitelist alone would accept a script renamed to `.jpg` and declared as
 * `image/jpeg`. These checks read the file's own magic bytes instead.
 *
 * SVG is deliberately absent from the accepted set: it is an XML document that
 * can carry `<script>` and event handlers, so serving user-supplied SVG from
 * our own origin would hand an author stored XSS (SRS 7, Security). Vector
 * assets are supplied by the design team as part of the codebase instead.
 */

export type DetectedType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'
  | 'image/avif'
  | 'application/pdf'

interface Signature {
  type: DetectedType
  /** Byte offset the pattern starts at. */
  offset: number
  /** Byte values to match; `null` means "any byte" at that position. */
  bytes: (number | null)[]
}

const SIGNATURES: Signature[] = [
  { type: 'image/jpeg', offset: 0, bytes: [0xff, 0xd8, 0xff] },
  { type: 'image/png', offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  // "GIF87a" / "GIF89a"
  { type: 'image/gif', offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] },
  // "RIFF" .... "WEBP" — the four size bytes between are ignored.
  {
    type: 'image/webp',
    offset: 0,
    bytes: [0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50],
  },
  // ISO-BMFF: "ftypavif" at offset 4 (the preceding 4 bytes are the box size).
  {
    type: 'image/avif',
    offset: 4,
    bytes: [0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66],
  },
  // "%PDF"
  { type: 'application/pdf', offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] },
]

const matches = (buffer: Buffer, signature: Signature): boolean => {
  const end = signature.offset + signature.bytes.length
  if (buffer.length < end) return false

  return signature.bytes.every((byte, index) => {
    if (byte === null) return true
    return buffer[signature.offset + index] === byte
  })
}

/** Returns the type the bytes actually are, or `null` if unrecognised. */
export const detectFileType = (buffer: Buffer): DetectedType | null => {
  for (const signature of SIGNATURES) {
    if (matches(buffer, signature)) return signature.type
  }
  return null
}

/**
 * Some MIME types are written more than one way by browsers and operating
 * systems. Declared types are normalised before being compared with the
 * detected type so a legitimate upload is not rejected on a spelling.
 */
const MIME_ALIASES: Record<string, DetectedType> = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'image/jpeg': 'image/jpeg',
  'image/png': 'image/png',
  'image/x-png': 'image/png',
  'image/gif': 'image/gif',
  'image/webp': 'image/webp',
  'image/avif': 'image/avif',
  'application/pdf': 'application/pdf',
  'application/x-pdf': 'application/pdf',
}

export const normaliseMimeType = (mimeType: string | null | undefined): DetectedType | null => {
  if (typeof mimeType !== 'string') return null
  return MIME_ALIASES[mimeType.toLowerCase().trim()] ?? null
}

export interface FileValidationResult {
  valid: boolean
  detected: DetectedType | null
  message?: string
}

/**
 * Validates a buffer against an allow-list, confirming both that the bytes are
 * a recognised type and that the declared type agrees with them.
 */
export const validateFileContent = (
  buffer: Buffer,
  declaredMimeType: string | null | undefined,
  allowed: readonly DetectedType[],
): FileValidationResult => {
  const detected = detectFileType(buffer)

  if (detected === null) {
    return {
      valid: false,
      detected: null,
      message:
        'This file’s contents are not a supported image or PDF. Accepted types are JPEG, PNG, GIF, WebP, AVIF and PDF.',
    }
  }

  if (!allowed.includes(detected)) {
    return {
      valid: false,
      detected,
      message: `Files of type ${detected} are not accepted here.`,
    }
  }

  const declared = normaliseMimeType(declaredMimeType)
  if (declared !== null && declared !== detected) {
    // A mismatch means the extension/type was changed — the exact case
    // BR-MED-05 exists to catch.
    return {
      valid: false,
      detected,
      message: `This file claims to be ${declaredMimeType} but its contents are ${detected}. Re-save the file in the correct format and try again.`,
    }
  }

  return { valid: true, detected }
}

export const IMAGE_TYPES: readonly DetectedType[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
]

export const DOCUMENT_TYPES: readonly DetectedType[] = ['application/pdf']

export const IMAGE_AND_DOCUMENT_TYPES: readonly DetectedType[] = [...IMAGE_TYPES, ...DOCUMENT_TYPES]
