/**
 * `heic-decode` ships no types, so the small surface this project uses is
 * declared here rather than pulling the whole module in as `any`.
 *
 * Used only by `scripts/photos.ts`, to decode the HEIC photographs SIWS sent —
 * see the note there on why sharp cannot do it alone.
 */
declare module 'heic-decode' {
  interface DecodeResult {
    width: number
    height: number
    /** Raw RGBA, four bytes per pixel. */
    data: ArrayBufferLike
  }

  export default function decode(input: { buffer: Buffer }): Promise<DecodeResult>
}
