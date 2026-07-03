import { getSupabaseConfigError, supabase } from '../lib/supabaseClient'
import { createId, getAccountType, getDisplayName, isPrivateAccountType, normalizeAccountType, todayKey } from './studyUtils'

export const DEFAULT_ROOM_NAME = 'Private Study Room'

function getClient() {
  if (!supabase) {
    throw new Error(getSupabaseConfigError())
  }

  return supabase
}

function normalizeTask(task) {
  return {
    id: task.id,
    title: task.title,
    owner: task.owner_label,
    ownerId: task.owner_id,
    subject: task.subject,
    priority: task.priority,
    dueDate: task.due_date,
    status: task.status,
    createdAt: task.created_at,
  }
}

function normalizeCheckin(checkin) {
  return {
    id: checkin.id,
    member: checkin.member_label,
    userId: checkin.user_id,
    date: checkin.checkin_date,
    studied: checkin.studied,
    hours: Number(checkin.hours || 0),
    mood: checkin.mood,
    topic: checkin.topic,
    createdAt: checkin.created_at,
  }
}

function normalizeSession(session) {
  return {
    id: session.id,
    member: session.member_label,
    userId: session.user_id,
    subject: session.subject,
    durationMinutes: session.duration_minutes,
    focusRating: session.focus_rating,
    wentWell: session.went_well,
    difficult: session.difficult,
    createdAt: session.created_at,
  }
}

function normalizeNote(note) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    visibility: note.visibility,
    owner: note.owner_label,
    userId: note.user_id,
    createdAt: note.created_at,
  }
}

function normalizeEncouragement(encouragement) {
  return {
    id: encouragement.id,
    from: encouragement.from_label,
    userId: encouragement.user_id,
    message: encouragement.message,
    createdAt: encouragement.created_at,
  }
}

function normalizeActivity(item) {
  return {
    id: item.id,
    actor: item.actor_label,
    userId: item.user_id,
    message: item.message,
    type: item.type,
    createdAt: item.created_at,
  }
}

export function getRoomNameForAccountType(accountType) {
  return `${normalizeAccountType(accountType)} Private Study Room`
}

export async function upsertProfile(user, accountType) {
  const client = getClient()
  const { data: existingProfile, error: existingError } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (existingError) throw existingError

  const nextAccountType = normalizeAccountType(
    accountType ||
      existingProfile?.account_type ||
      user.user_metadata?.account_type ||
      existingProfile?.display_name ||
      user.user_metadata?.display_name,
  )
  const profile = {
    id: user.id,
    email: user.email,
    account_type: nextAccountType,
    display_name: existingProfile?.display_name || user.user_metadata?.display_name || getDisplayName(null, user),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await client.from('profiles').upsert(profile).select('*').single()
  if (error) throw error
  return data
}

export async function updateProfileAccountType(userId, accountType) {
  const client = getClient()
  const nextAccountType = normalizeAccountType(accountType)
  const { data, error } = await client
    .from('profiles')
    .update({
      account_type: nextAccountType,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function fetchProfile(userId) {
  const client = getClient()
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data
}

export async function fetchUserRooms(userId) {
  const client = getClient()
  const { data, error } = await client
    .from('room_members')
    .select('id, role, room_id, rooms(id, name, owner_id, room_type, created_at)')
    .eq('user_id', userId)

  if (error) throw error

  return (data || [])
    .filter((membership) => membership.rooms)
    .map((membership) => ({
      membershipId: membership.id,
      role: membership.role,
      room: membership.rooms,
    }))
}

export async function fetchActiveRoomForUser(userId) {
  const rooms = await fetchUserRooms(userId)
  return rooms[0] || null
}

export async function createPrivateRoomForUser(user, profile) {
  const client = getClient()
  const accountType = getAccountType(profile, user)

  if (!isPrivateAccountType(accountType)) {
    throw new Error('Private rooms are available for Couples and VIP accounts.')
  }

  const { data: room, error: roomError } = await client
    .from('rooms')
    .insert({
      id: createId(),
      name: getRoomNameForAccountType(accountType),
      owner_id: user.id,
      room_type: accountType,
    })
    .select('*')
    .single()

  if (roomError) throw roomError

  const { data: membership, error: membershipError } = await client
    .from('room_members')
    .insert({
      id: createId(),
      room_id: room.id,
      user_id: user.id,
      role: 'owner',
    })
    .select('*')
    .single()

  if (membershipError) throw membershipError

  await insertActivity({
    actor: accountType,
    message: `Created a ${accountType} private study room.`,
    roomId: room.id,
    type: 'system',
    userId: user.id,
  })

  return {
    membershipId: membership.id,
    role: membership.role,
    room,
  }
}

export async function fetchRoomData(roomId) {
  const client = getClient()
  const [tasks, checkins, sessions, notes, encouragements, activity] = await Promise.all([
    client.from('tasks').select('*').eq('room_id', roomId).order('created_at', { ascending: false }),
    client.from('checkins').select('*').eq('room_id', roomId).order('created_at', { ascending: false }),
    client
      .from('study_sessions')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false }),
    client.from('notes').select('*').eq('room_id', roomId).order('created_at', { ascending: false }),
    client
      .from('encouragements')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false }),
    client.from('activity').select('*').eq('room_id', roomId).order('created_at', { ascending: false }).limit(32),
  ])

  const firstError = [tasks, checkins, sessions, notes, encouragements, activity].find((result) => result.error)
  if (firstError?.error) throw firstError.error

  return {
    activity: (activity.data || []).map(normalizeActivity),
    checkins: (checkins.data || []).map(normalizeCheckin),
    encouragements: (encouragements.data || []).map(normalizeEncouragement),
    notes: (notes.data || []).map(normalizeNote),
    sessions: (sessions.data || []).map(normalizeSession),
    tasks: (tasks.data || []).map(normalizeTask),
  }
}

export async function fetchDashboardData(roomId) {
  if (!roomId) {
    return { activity: [], checkins: [], encouragements: [], notes: [], sessions: [], tasks: [] }
  }

  return fetchRoomData(roomId)
}

export async function insertActivity({ actor, message, roomId, type = 'update', userId }) {
  const client = getClient()
  const { error } = await client.from('activity').insert({
    id: createId(),
    actor_label: actor,
    message,
    room_id: roomId,
    type,
    user_id: userId,
  })

  if (error) throw error
}

export async function insertTask({ actor, roomId, task, userId }) {
  const client = getClient()
  const { error } = await client.from('tasks').insert({
    id: task.id,
    due_date: task.dueDate,
    owner_id: task.owner === actor ? userId : null,
    owner_label: task.owner,
    priority: task.priority,
    room_id: roomId,
    status: task.status,
    subject: task.subject,
    title: task.title,
  })

  if (error) throw error
}

export async function updateTaskStatus({ status, taskId }) {
  const client = getClient()
  const { error } = await client
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', taskId)

  if (error) throw error
}

export async function deleteTask(taskId) {
  const client = getClient()
  const { error } = await client.from('tasks').delete().eq('id', taskId)
  if (error) throw error
}

export async function upsertCheckin({ checkin, roomId, userId }) {
  const client = getClient()
  const { error } = await client.from('checkins').upsert(
    {
      id: checkin.id,
      checkin_date: checkin.date || todayKey(),
      hours: checkin.hours,
      member_label: checkin.member,
      mood: checkin.mood,
      room_id: roomId,
      studied: checkin.studied,
      topic: checkin.topic,
      user_id: userId,
    },
    { onConflict: 'room_id,user_id,checkin_date' },
  )

  if (error) throw error
}

export async function insertSession({ actor, roomId, session, userId }) {
  const client = getClient()
  const { error } = await client.from('study_sessions').insert({
    id: session.id,
    difficult: session.difficult,
    duration_minutes: session.durationMinutes,
    focus_rating: session.focusRating,
    member_label: actor,
    room_id: roomId,
    subject: session.subject,
    user_id: userId,
    went_well: session.wentWell,
  })

  if (error) throw error
}

export async function insertNote({ actor, note, roomId, userId }) {
  const client = getClient()
  const { error } = await client.from('notes').insert({
    id: note.id,
    content: note.content,
    owner_label: actor,
    room_id: roomId,
    title: note.title,
    user_id: userId,
    visibility: note.visibility,
  })

  if (error) throw error
}

export async function deleteNote(noteId) {
  const client = getClient()
  const { error } = await client.from('notes').delete().eq('id', noteId)
  if (error) throw error
}

export async function insertEncouragement({ actor, encouragement, roomId, userId }) {
  const client = getClient()
  const { error } = await client.from('encouragements').insert({
    id: encouragement.id,
    from_label: actor,
    message: encouragement.message,
    room_id: roomId,
    user_id: userId,
  })

  if (error) throw error
}
