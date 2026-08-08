import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { getNavItems, getUnits, resolveRoute } from '@/lib/site'
import type { Media, Page, Unit } from '@/payload-types'

interface RouteProps {
  params: Promise<{ segments: string[] }>
}

/**
 * The single public route.
 *
 * One catch-all handles `/{unit}`, `/{unit}/{page}` and `/{page}` rather than
 * three overlapping route files. Next resolves overlapping dynamic segments by
 * specificity rules that are easy to get subtly wrong; with one entry point the
 * precedence between "unit" and "institution page" is explicit in
 * `resolveRoute` and testable on its own.
 */
const DynamicRoute = async ({ params }: RouteProps) => {
  const { segments } = await params
  const { isEnabled: draft } = await draftMode()

  const resolved = await resolveRoute(segments, draft)
  if (!resolved) notFound()

  const { unit, page, kind } = resolved
  const units = await getUnits()
  const navItems = await getNavItems(unit?.id ?? null, unit?.slug ?? null)

  const footerUnits = units.map(({ id, slug, shortName }) => ({ id, slug, shortName }))

  return (
    <>
      <SiteHeader
        unit={unit}
        units={units}
        navItems={navItems}
        // The tagline now sits in the identity band, so repeating it in the
        // strip immediately beneath would say the same thing twice.
        infoText={null}
        cta={unit ? { label: 'Enquire about admission', href: `/${unit.slug}` } : null}
      />

      <main id="main-content">
        {/* Only shown when a unit has no landing page published yet. */}
        {kind === 'unit-home' && unit && !page ? <UnitPlaceholder unit={unit} /> : null}

        {page ? (
          <>
            {/*
              A hero block carries its own H1, so rendering the page title above
              it too would put two H1s on the page and break the heading outline.
            */}
            {hasOwnHeading(page.layout) ? null : (
              <header className="siws-container pt-12 pb-2">
                <h1 className="text-4xl sm:text-5xl">{page.title}</h1>
                {page.intro ? (
                  <p className="mt-4 max-w-3xl text-lg text-ink-muted">{page.intro}</p>
                ) : null}
              </header>
            )}
            <RenderBlocks blocks={page.layout} unit={unit} units={units} />
          </>
        ) : null}
      </main>

      <SiteFooter unit={unit} quickLinks={navItems} units={footerUnits} />
    </>
  )
}

/**
 * Shown when a unit exists but has no landing page yet.
 *
 * Deliberately not a 404: the unit is real and its other pages work, so the
 * honest state is "nothing published here yet" rather than "does not exist".
 */
const UnitPlaceholder = ({ unit }: { unit: Unit }) => (
  <section className="siws-container py-16">
    <h1 className="text-4xl sm:text-5xl">{unit.name}</h1>
    {unit.description ? (
      <p className="mt-5 max-w-2xl text-lg text-ink-muted">{unit.description}</p>
    ) : null}
    <p className="mt-6 text-ink-muted">
      This school&rsquo;s home page has not been published yet.
    </p>
  </section>
)

export const generateMetadata = async ({ params }: RouteProps): Promise<Metadata> => {
  const { segments } = await params
  const resolved = await resolveRoute(segments)

  if (!resolved) return { title: 'Page not found' }

  const { unit, page, kind } = resolved

  if (!page) {
    return {
      title: unit?.name ?? undefined,
      description: unit?.description ?? undefined,
      alternates: { canonical: unit?.slug ? `/${unit.slug}` : '/' },
    }
  }

  /**
   * A unit's landing page is served at `/{unit}`, so that — not
   * `/{unit}/home` — is its canonical address (BR-SEO-04).
   */
  const canonical =
    kind === 'unit-home' && unit?.slug
      ? `/${unit.slug}`
      : unit?.slug
        ? `/${unit.slug}/${page.slug}`
        : `/${page.slug}`
  const description = page.metaDescription || page.intro || unit?.description || undefined
  const shareImage = resolveShareImage(page, unit)

  return {
    title: page.metaTitle || page.title,
    description,
    // BR-SEO-04 — canonical URLs, and per-page indexing directives.
    alternates: { canonical },
    robots: page.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: page.metaTitle || page.title,
      description,
      url: canonical,
      type: 'article',
      ...(shareImage ? { images: [{ url: shareImage }] } : {}),
    },
  }
}

/**
 * True when the first section already renders the page's H1.
 *
 * Checked against the first block only: a hero further down the page would not
 * be acting as the page heading, so the title header still belongs above it.
 */
const hasOwnHeading = (layout: Page['layout']): boolean => {
  const first = Array.isArray(layout) ? layout[0] : undefined
  return first?.blockType === 'heroEnquiry' || first?.blockType === 'hero'
}

/** Page share image, falling back to the unit hero (BR-SEO-05). */
const resolveShareImage = (page: Page, unit: Unit | null): string | null => {
  const candidates: unknown[] = [page.ogImage, unit?.heroImage, unit?.logo]

  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'object') {
      const media = candidate as Media
      // Prefer the 1200×630 derivative generated for social platforms.
      const og = media.sizes?.og?.url
      if (typeof og === 'string' && og.length > 0) return og
      if (typeof media.url === 'string' && media.url.length > 0) return media.url
    }
  }

  return null
}

export default DynamicRoute
