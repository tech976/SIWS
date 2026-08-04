/**
 * SRS 8.1 — Roles.
 *
 * Roles are held as a *set*, not a single value, because the SRS states:
 * "the DPO role may be held alongside another role, in which case the
 * permissions combine" (8.2, legend). Every permission check therefore asks
 * "does this user hold role X?" rather than "is this user role X?".
 */
export const ROLES = {
  /** Full control of the platform, all units, users, menus and configuration. */
  admin: 'admin',
  /** Principal / head of a unit. Reviews and approves content for their unit. */
  unitHead: 'unitHead',
  /** Designated staff member who adds, edits and removes content in their unit. */
  contentManager: 'contentManager',
  /** Staff with limited rights over specific sections (e.g. news, gallery). */
  editor: 'editor',
  /** Data Protection Officer / grievance contact. Cross-unit, data-only access. */
  dpo: 'dpo',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_OPTIONS: { label: string; value: Role }[] = [
  { label: 'Administrator', value: ROLES.admin },
  { label: 'Unit Head (Approver)', value: ROLES.unitHead },
  { label: 'Unit Content Manager', value: ROLES.contentManager },
  { label: 'Editor / Staff', value: ROLES.editor },
  { label: 'Data Protection Officer', value: ROLES.dpo },
]

/**
 * Sections an Editor can be restricted to (SRS 8.1: "Limited updates within
 * assigned sections (e.g. news, gallery)"). Adding a section here and to the
 * owning collection is all that is required to extend the model — no access
 * code changes (NFR Maintainability).
 */
export const SECTIONS = {
  news: 'news',
  events: 'events',
  gallery: 'gallery',
  studentWall: 'studentWall',
  achievements: 'achievements',
  quotes: 'quotes',
  faculty: 'faculty',
  faq: 'faq',
  downloads: 'downloads',
  calendar: 'calendar',
  alumni: 'alumni',
  careers: 'careers',
  pages: 'pages',
  facilities: 'facilities',
  transport: 'transport',
} as const

export type SectionKey = (typeof SECTIONS)[keyof typeof SECTIONS]

export const SECTION_OPTIONS: { label: string; value: SectionKey }[] = [
  { label: 'News & Announcements', value: SECTIONS.news },
  { label: 'Events', value: SECTIONS.events },
  { label: 'Photo & Video Gallery', value: SECTIONS.gallery },
  { label: 'Student Wall', value: SECTIONS.studentWall },
  { label: 'Achievements', value: SECTIONS.achievements },
  { label: 'Quotes & Stories', value: SECTIONS.quotes },
  { label: 'Faculty Profiles', value: SECTIONS.faculty },
  { label: 'FAQ', value: SECTIONS.faq },
  { label: 'Download Centre', value: SECTIONS.downloads },
  { label: 'Annual Calendar', value: SECTIONS.calendar },
  { label: 'Alumni', value: SECTIONS.alumni },
  { label: 'Careers', value: SECTIONS.careers },
  { label: 'Pages', value: SECTIONS.pages },
  { label: 'Facilities & Campus', value: SECTIONS.facilities },
  { label: 'Transport', value: SECTIONS.transport },
]
