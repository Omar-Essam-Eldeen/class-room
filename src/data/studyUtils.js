export const ACCOUNT_TYPES = ['Student', 'Couples', 'VIP']
export const PRIVATE_ACCOUNT_TYPES = ['Couples', 'VIP']
export const MEMBERS = ['VIP', 'Couples']

export function normalizeAccountType(value) {
  if (value === 'Magic') return 'VIP'
  if (value === 'Partner') return 'Couples'
  if (value === 'Guest') return 'Student'
  return ACCOUNT_TYPES.includes(value) ? value : 'Student'
}

export function isPrivateAccountType(value) {
  return PRIVATE_ACCOUNT_TYPES.includes(normalizeAccountType(value))
}

export function todayKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (character) =>
    (
      Number(character) ^
      (globalThis.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(character) / 4)))
    ).toString(16),
  )
}

export function formatShortDate(value) {
  if (!value) return 'No date'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

export function formatTime(value) {
  if (!value) return 'Just now'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function computeCurrentStreak(checkins) {
  const studiedDates = new Set(
    checkins.filter((checkin) => checkin.studied).map((checkin) => checkin.date),
  )
  let cursor = new Date()
  let streak = 0

  while (studiedDates.has(todayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export function getWeekHours(checkins) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 6)

  return checkins.reduce((total, checkin) => {
    const checkinDate = new Date(`${checkin.date}T12:00:00`)
    return checkinDate >= start ? total + Number(checkin.hours || 0) : total
  }, 0)
}

export function getDisplayName(profile, user) {
  if (profile?.display_name) return profile.display_name
  if (user?.user_metadata?.display_name) return user.user_metadata.display_name
  if (user?.email) return user.email.split('@')[0]
  return 'Student'
}

export function getAccountType(profile, user) {
  return normalizeAccountType(
    profile?.account_type ||
      user?.user_metadata?.account_type ||
      profile?.display_name ||
      user?.user_metadata?.display_name,
  )
}
