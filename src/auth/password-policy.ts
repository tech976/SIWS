/**
 * BR-AUTH-03 — "enforce a minimum password-strength policy".
 *
 * Payload has no built-in policy, so this is applied from a collection hook
 * before the value is hashed. The rules follow NIST SP 800-63B: length is the
 * dominant factor, and we screen against context-specific words (the user's own
 * name, email and the school's name) which are the passwords staff actually
 * choose when left to themselves.
 */

const MIN_LENGTH = 12
const MAX_LENGTH = 128

/**
 * Deliberately small: this is a guard against the handful of passwords a
 * hurried staff member reaches for, not a substitute for a breach-corpus check.
 */
const BANNED_SUBSTRINGS = [
  'password',
  'passw0rd',
  'qwerty',
  'asdfgh',
  '12345678',
  '11111111',
  'abcdefg',
  'letmein',
  'welcome',
  'admin123',
  'siws',
  'school',
  'wadala',
  'mumbai',
]

export interface PasswordContext {
  email?: string | null
  name?: string | null
}

export interface PasswordCheckResult {
  valid: boolean
  message?: string
}

/** Detects "abcdef" / "123456" style runs of 5 or more sequential characters. */
const hasLongSequentialRun = (value: string): boolean => {
  let ascending = 1
  let descending = 1

  for (let i = 1; i < value.length; i += 1) {
    const delta = value.charCodeAt(i) - value.charCodeAt(i - 1)
    ascending = delta === 1 ? ascending + 1 : 1
    descending = delta === -1 ? descending + 1 : 1
    if (ascending >= 5 || descending >= 5) return true
  }

  return false
}

/** Detects a single character repeated 4 or more times in a row. */
const hasLongRepeat = (value: string): boolean => /(.)\1{3,}/.test(value)

export const checkPasswordStrength = (
  password: unknown,
  context: PasswordContext = {},
): PasswordCheckResult => {
  if (typeof password !== 'string' || password.length === 0) {
    return { valid: false, message: 'A password is required.' }
  }

  if (password.length < MIN_LENGTH) {
    return {
      valid: false,
      message: `Password must be at least ${MIN_LENGTH} characters long.`,
    }
  }

  // Guards against a very long input being fed to the hash function.
  if (password.length > MAX_LENGTH) {
    return { valid: false, message: `Password must be ${MAX_LENGTH} characters or fewer.` }
  }

  if (password.trim().length !== password.length) {
    return { valid: false, message: 'Password must not begin or end with a space.' }
  }

  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((pattern) =>
    pattern.test(password),
  ).length

  if (classes < 3) {
    return {
      valid: false,
      message:
        'Password must include at least three of: lowercase letters, uppercase letters, numbers, symbols.',
    }
  }

  const lowered = password.toLowerCase()

  const banned = BANNED_SUBSTRINGS.find((word) => lowered.includes(word))
  if (banned) {
    return {
      valid: false,
      message: `Password must not contain the common or easily-guessed word "${banned}".`,
    }
  }

  // The local part of the user's own email address, and each part of their
  // name, are the most predictable guesses of all.
  const personalTokens: string[] = []

  if (typeof context.email === 'string' && context.email.includes('@')) {
    const localPart = context.email.split('@')[0]
    if (localPart && localPart.length >= 3) personalTokens.push(localPart.toLowerCase())
  }

  if (typeof context.name === 'string') {
    for (const part of context.name.split(/\s+/)) {
      if (part.length >= 3) personalTokens.push(part.toLowerCase())
    }
  }

  const personal = personalTokens.find((token) => lowered.includes(token))
  if (personal) {
    return {
      valid: false,
      message: 'Password must not contain your name or email address.',
    }
  }

  if (hasLongRepeat(password)) {
    return { valid: false, message: 'Password must not repeat the same character four times.' }
  }

  if (hasLongSequentialRun(password)) {
    return {
      valid: false,
      message: 'Password must not contain a long run of sequential characters such as "12345".',
    }
  }

  return { valid: true }
}
