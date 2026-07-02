export const STORAGE_KEYS = {
  user: 'classroom_user',
  privateAccess: 'classroom_private_access',
  tasks: 'classroom_tasks',
  checkins: 'classroom_checkins',
  sessions: 'classroom_sessions',
  notes: 'classroom_notes',
  activity: 'classroom_activity',
  encouragements: 'classroom_encouragements',
}

export const PRIVATE_PASSCODE = 'CLASSROOM2026'
export const MEMBERS = ['Magic', 'Partner']

export function todayKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function createId(prefix = 'item') {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function readStorage(key, fallback) {
  if (!globalThis.localStorage) return fallback

  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  if (!globalThis.localStorage) return value

  localStorage.setItem(key, JSON.stringify(value))
  return value
}

export function getStoredUser() {
  return readStorage(STORAGE_KEYS.user, 'Guest')
}

export function setStoredUser(user) {
  writeStorage(STORAGE_KEYS.user, user)

  if (user === 'Guest') {
    writeStorage(STORAGE_KEYS.privateAccess, false)
  }
}

export function hasPrivateAccess() {
  return readStorage(STORAGE_KEYS.privateAccess, false) === true
}

export function setPrivateAccess(value) {
  writeStorage(STORAGE_KEYS.privateAccess, value)
}

export function canEnterPrivateRoom(user = getStoredUser()) {
  return MEMBERS.includes(user) && hasPrivateAccess()
}

export function createActivity(message, type = 'update', actor = getStoredUser()) {
  return {
    id: createId('activity'),
    actor,
    message,
    type,
    createdAt: new Date().toISOString(),
  }
}

export function addActivity(message, type = 'update', actor = getStoredUser()) {
  const current = readStorage(STORAGE_KEYS.activity, [])
  const next = [createActivity(message, type, actor), ...current].slice(0, 32)
  writeStorage(STORAGE_KEYS.activity, next)
  return next
}

export function formatShortDate(value) {
  if (!value) return 'No date'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

export function formatTime(value) {
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

function getDefaultData() {
  const today = todayKey()
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = todayKey(yesterdayDate)

  return {
    [STORAGE_KEYS.tasks]: [
      {
        id: 'task-default-1',
        title: 'Review physics chapter 4',
        owner: 'Magic',
        subject: 'Physics',
        priority: 'High',
        dueDate: today,
        status: 'Doing',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-default-2',
        title: 'Make vocabulary flashcards',
        owner: 'Partner',
        subject: 'English',
        priority: 'Medium',
        dueDate: today,
        status: 'Todo',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-default-3',
        title: 'Plan weekend study sprint',
        owner: 'Both',
        subject: 'Planning',
        priority: 'Low',
        dueDate: yesterday,
        status: 'Done',
        createdAt: new Date().toISOString(),
      },
    ],
    [STORAGE_KEYS.checkins]: [
      {
        id: 'checkin-default-1',
        member: 'Magic',
        date: today,
        studied: true,
        hours: 2,
        mood: 'Motivated',
        topic: 'Physics formulas and practice questions',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'checkin-default-2',
        member: 'Partner',
        date: yesterday,
        studied: true,
        hours: 1.5,
        mood: 'Focused',
        topic: 'English vocabulary review',
        createdAt: new Date().toISOString(),
      },
    ],
    [STORAGE_KEYS.sessions]: [
      {
        id: 'session-default-1',
        member: 'Magic',
        subject: 'Physics',
        durationMinutes: 45,
        focusRating: 8,
        wentWell: 'Kept momentum through the hardest problem set.',
        difficult: 'Needed more examples for circular motion.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'session-default-2',
        member: 'Partner',
        subject: 'English',
        durationMinutes: 25,
        focusRating: 7,
        wentWell: 'Finished flashcard review without getting distracted.',
        difficult: 'A few definitions still need repetition.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
    ],
    [STORAGE_KEYS.notes]: [
      {
        id: 'note-default-1',
        title: 'Physics reminder',
        content: 'Write formulas first, then plug in values slowly.',
        visibility: 'Shared',
        owner: 'Magic',
        createdAt: new Date().toISOString(),
      },
    ],
    [STORAGE_KEYS.encouragements]: [
      {
        id: 'encouragement-default-1',
        from: 'Magic',
        message: 'Small steps count. Let us keep the streak alive today.',
        createdAt: new Date().toISOString(),
      },
    ],
    [STORAGE_KEYS.activity]: [
      {
        id: 'activity-default-1',
        actor: 'Class Room',
        message: 'Demo room was prepared with starter goals and notes.',
        type: 'system',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'activity-default-2',
        actor: 'Magic',
        message: 'Completed "Plan weekend study sprint".',
        type: 'task',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
  }
}

export function ensureDemoData() {
  const defaults = getDefaultData()

  Object.entries(defaults).forEach(([key, value]) => {
    if (!globalThis.localStorage) return

    if (localStorage.getItem(key) === null) {
      writeStorage(key, value)
    }
  })
}
