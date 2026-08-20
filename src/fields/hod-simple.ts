import type { Condition } from 'payload'

import { isAdmin, isHod, type AccessUser } from '@/access/user'

/**
 * Hides a field from Heads of Department while leaving it for everyone else.
 *
 * Used on the machinery an HOD should never meet: the URL slug, the department
 * relationship (filled in for them, since they belong to exactly one), and the
 * publish/unpublish scheduling. The trustees asked that HODs "manage content
 * only"; a form that opens with four fields about routing and scheduling before
 * the title is the opposite of that.
 *
 * This hides the input, it does not remove the data. The slug is still
 * generated, the unit is still stamped by `constrainUnitToScope`, and an
 * administrator opening the same document sees all of it. Nothing here is a
 * permission — the access rules on the field and the collection are.
 */
export const hideFromHod: Condition = (_data, _siblingData, { user }) => {
  const account = user as AccessUser | null
  if (isAdmin(account)) return true
  return !isHod(account)
}
