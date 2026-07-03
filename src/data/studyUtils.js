export const ACCOUNT_TYPES = ['student', 'couples', 'vip']
export const PRIVATE_ACCOUNT_TYPES = ['couples', 'vip']
export const MEMBERS = ['VIP', 'Couples']

export const ACCOUNT_TYPE_LABELS = {
  student: 'Student',
  couples: 'Couples',
  vip: 'VIP',
}

export const ROOM_TYPE_CONFIG = {
  student: {
    label: 'Student',
    maxMembers: 15,
    defaultStyle: 'Cozy Library',
    designStyles: ['Cozy Library', 'Night Focus', 'Minimal Study'],
    tools: ['Tasks', 'Focus timer', 'Notes', 'Basic progress', 'Limited AI mock tools'],
  },
  couples: {
    label: 'Couples',
    maxMembers: 2,
    defaultStyle: 'Soft Couple Room',
    designStyles: ['Soft Couple Room', 'Night Focus', 'Cozy Library'],
    tools: [
      'Shared tasks',
      'Shared check-ins',
      'Shared notes',
      'Focus sessions',
      'Motivation box',
      'Shared progress',
      'Room customization',
    ],
  },
  vip: {
    label: 'VIP',
    maxMembers: 5,
    defaultStyle: 'VIP Glass Suite',
    designStyles: ['VIP Glass Suite', 'Cyber Academy', 'Night Focus'],
    tools: [
      'All Student tools',
      'All Couples tools',
      'Advanced AI mock tools',
      'Full customization',
      'VIP analytics',
      'Page previews',
      'Theme controls',
    ],
  },
}

export const ROOM_DESIGN_STYLES = [
  'Cozy Library',
  'Night Focus',
  'Minimal Study',
  'Cyber Academy',
  'Soft Couple Room',
  'VIP Glass Suite',
]

export const ROOM_TYPE_PRIORITY = {
  vip: 3,
  couples: 2,
  student: 1,
}

export const ACCOUNT_TYPE_PRIORITY = ROOM_TYPE_PRIORITY

export const ACCOUNT_ROOM_LIMITS = {
  student: 1,
  couples: 3,
  vip: 5,
}

const legacyAccountMap = {
  Guest: 'student',
  Magic: 'vip',
  Partner: 'couples',
  Student: 'student',
  Couples: 'couples',
  VIP: 'vip',
}

export function normalizeAccountType(value) {
  if (!value) return 'student'
  const normalized = legacyAccountMap[value] || String(value).toLowerCase()
  return ACCOUNT_TYPES.includes(normalized) ? normalized : 'student'
}

export function getAccountTypeLabel(value) {
  return ACCOUNT_TYPE_LABELS[normalizeAccountType(value)]
}

export function isPrivateAccountType(value) {
  return PRIVATE_ACCOUNT_TYPES.includes(normalizeAccountType(value))
}

export function isVipAccount(value) {
  return normalizeAccountType(value) === 'vip'
}

export function getRoomTypeConfig(value) {
  return ROOM_TYPE_CONFIG[normalizeAccountType(value)]
}

export function getRoomTools(roomType) {
  return getRoomTypeConfig(roomType).tools
}

export function getRoomMaxMembers(roomType) {
  return getRoomTypeConfig(roomType).maxMembers
}

export function getAccountRoomLimit(accountType) {
  return ACCOUNT_ROOM_LIMITS[normalizeAccountType(accountType)]
}

export function hasRoomLimitReached(accountType, roomCount) {
  return Number(roomCount || 0) >= getAccountRoomLimit(accountType)
}

export function getDefaultDesignStyle(roomType) {
  return getRoomTypeConfig(roomType).defaultStyle
}

export function getDefaultRoomName(roomType) {
  return `${getAccountTypeLabel(roomType)} Study Room`
}

export function getRoomOccupancy(room) {
  const maxMembers = Number(room?.maxMembers || room?.max_members || getRoomMaxMembers(room?.roomType || room?.room_type))
  const currentMembers = Number(room?.currentMembers || room?.current_members || 0)
  return maxMembers ? Math.min(currentMembers / maxMembers, 1) : 0
}

export function getRoomStatus(room) {
  const maxMembers = Number(room?.maxMembers || room?.max_members || getRoomMaxMembers(room?.roomType || room?.room_type))
  const currentMembers = Number(room?.currentMembers || room?.current_members || 0)

  if (currentMembers >= maxMembers) return 'Full'
  if (currentMembers === 0) return 'Available'
  if (normalizeAccountType(room?.roomType || room?.room_type) === 'student') {
    return currentMembers <= 1 ? 'Available' : 'Busy'
  }

  return 'Busy'
}

export function canCreateRoomType(accountType, roomType) {
  const account = normalizeAccountType(accountType)
  const room = normalizeAccountType(roomType)

  if (account === 'student') return room === 'student'
  if (account === 'couples') return room === 'student' || room === 'couples'
  if (account === 'vip') return room === 'student' || room === 'vip'

  return false
}

export function canJoinRoomType(accountType, room, isMember = false) {
  const account = normalizeAccountType(accountType)
  const roomType = normalizeAccountType(room?.roomType || room?.room_type)

  if (isMember) return true
  if (getRoomStatus(room) === 'Full') return false
  if (roomType === 'student') return account === 'student' || account === 'couples' || account === 'vip'
  if (roomType === 'couples') return account === 'couples'
  if (roomType === 'vip') return account === 'vip'

  return false
}

export function getActivityLevel(score = 0) {
  if (score >= 500) return 'Legendary'
  if (score >= 200) return 'Very active'
  if (score >= 80) return 'Active'
  if (score >= 20) return 'Warming up'
  return 'New'
}

export function getRewardBadges(profile = {}, streak = 0) {
  const badges = []
  const stars = Number(profile.stars || 0)

  if (stars > 0) badges.push('Starter Star')
  if (streak >= 7) badges.push('7-day streak')
  if (streak >= 30) badges.push('30-day focus')
  if (streak >= 90) badges.push('Couples trial earned')
  if (streak >= 365) badges.push('VIP month earned')

  return badges
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
  return 'Visitor'
}

export function getAccountType(profile, user) {
  return normalizeAccountType(
    profile?.account_type ||
      user?.user_metadata?.account_type ||
      profile?.display_name ||
      user?.user_metadata?.display_name,
  )
}

export function getEffectiveAccountType(profile, user) {
  const realAccountType = getAccountType(profile, user)
  const trialAccountType = profile?.trial_account_type ? normalizeAccountType(profile.trial_account_type) : ''
  const trialExpiresAt = profile?.trial_expires_at ? new Date(profile.trial_expires_at) : null
  const trialActive = trialAccountType && trialExpiresAt && trialExpiresAt > new Date()

  if (trialActive && ACCOUNT_TYPE_PRIORITY[trialAccountType] > ACCOUNT_TYPE_PRIORITY[realAccountType]) {
    return trialAccountType
  }

  return realAccountType
}
