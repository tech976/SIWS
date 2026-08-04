import type { SelectField } from 'payload'

/**
 * Campus — a location within a school, not a school of its own.
 *
 * SIWS runs the Primary Section at two locations, Wadala and Matunga, and the
 * K.G. Section likewise (several endowment funds name "K.G. section Wadala"
 * and "K.G. section Matunga" separately). They share a board, a curriculum and
 * an admissions policy, but each has its own head teacher, its own roster and
 * its own house rules.
 *
 * MODELLED AS A FIELD, NOT A UNIT
 * -------------------------------
 * The SRS defines exactly four units — Kindergarten, Primary, Secondary and
 * Junior College — and the main portal's navigation is built from them. A fifth
 * "Primary Matunga" unit would put a second Primary School in that list as
 * though it were a separate school, and would split one section's content under
 * two unit heads. A campus field keeps the section whole and still lets a page,
 * a roster or an enquiry say exactly which location it means.
 *
 * Left blank means "the whole school", which is the correct answer for every
 * unit that runs at one location.
 */

export const CAMPUS_VALUES = ['wadala', 'matunga'] as const

export type Campus = (typeof CAMPUS_VALUES)[number]

export const CAMPUS_LABELS: Record<Campus, string> = {
  wadala: 'Wadala',
  matunga: 'Matunga',
}

export const CAMPUS_OPTIONS = CAMPUS_VALUES.map((value) => ({
  label: CAMPUS_LABELS[value],
  value,
}))

interface CampusFieldOptions {
  label?: string
  description?: string
  position?: 'sidebar'
  admin?: SelectField['admin']
}

export const campusField = ({
  label = 'Campus',
  description = 'Leave blank if your school is at one location only.',
  position,
  admin,
}: CampusFieldOptions = {}): SelectField => ({
  name: 'campus',
  type: 'select',
  label,
  options: CAMPUS_OPTIONS,
  index: true,
  admin: {
    ...(position ? { position } : {}),
    description,
    ...admin,
  },
})
