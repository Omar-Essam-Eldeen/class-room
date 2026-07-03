import { useCallback, useEffect, useMemo, useState } from 'react'
import { BadgeCheck, Crown, Flame, HeartHandshake, Sparkles, Target, UsersRound } from 'lucide-react'
import ActivityFeed from '../components/ActivityFeed'
import CheckInCard from '../components/CheckInCard'
import FocusTimer from '../components/FocusTimer'
import MockAITools from '../components/MockAITools'
import MotivationBox from '../components/MotivationBox'
import NotesBoard from '../components/NotesBoard'
import ProgressStats from '../components/ProgressStats'
import RoomMembershipPanel from '../components/RoomMembershipPanel'
import SessionFeedback from '../components/SessionFeedback'
import TaskBoard from '../components/TaskBoard'
import { useAuth } from '../context/useAuth'
import {
  deleteNote,
  deleteTask,
  fetchRoomData,
  insertActivity,
  insertEncouragement,
  insertNote,
  insertSession,
  insertTask,
  updateTaskStatus,
  upsertCheckin,
} from '../data/supabaseData'
import { MEMBERS, computeCurrentStreak, getWeekHours, todayKey } from '../data/studyUtils'

const emptyRoomData = {
  activity: [],
  checkins: [],
  encouragements: [],
  notes: [],
  sessions: [],
  tasks: [],
}

function PrivateRoomPage() {
  const { accountTypeLabel, activeRoom, user } = useAuth()
  const currentUser = accountTypeLabel
  const roomId = activeRoom?.id
  const userId = user?.id
  const [roomData, setRoomData] = useState(emptyRoomData)
  const [dataLoading, setDataLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [pendingSession, setPendingSession] = useState(null)

  const { activity, checkins, encouragements, notes, sessions, tasks } = roomData

  const loadRoom = useCallback(async () => {
    if (!roomId) return

    setDataLoading(true)
    setError('')

    try {
      setRoomData(await fetchRoomData(roomId))
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setDataLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    Promise.resolve().then(loadRoom)
  }, [loadRoom])

  const pushActivity = useCallback(
    async (message, type = 'update', actor = currentUser) => {
      if (!roomId || !userId) return

      await insertActivity({
        actor,
        message,
        roomId,
        type,
        userId,
      })
    },
    [currentUser, roomId, userId],
  )

  const updateTasks = useCallback(
    async (next, message, type) => {
      if (!roomId || !userId) return

      setSaving(true)
      setError('')

      try {
        const added = next.find((task) => !tasks.some((current) => current.id === task.id))
        const removed = tasks.find((task) => !next.some((current) => current.id === task.id))
        const changed = next.find((task) => {
          const current = tasks.find((item) => item.id === task.id)
          return current && current.status !== task.status
        })

        if (added) {
          await insertTask({ actor: currentUser, roomId, task: added, userId })
        } else if (removed) {
          await deleteTask(removed.id)
        } else if (changed) {
          await updateTaskStatus({ status: changed.status, taskId: changed.id })
        }

        await pushActivity(message, type)
        await loadRoom()
      } catch (nextError) {
        setError(nextError.message)
      } finally {
        setSaving(false)
      }
    },
    [currentUser, loadRoom, pushActivity, roomId, tasks, userId],
  )

  const updateCheckins = useCallback(
    async (_next, entry) => {
      if (!roomId || !userId) return

      setSaving(true)
      setError('')

      try {
        await upsertCheckin({ checkin: entry, roomId, userId })
        await pushActivity(`${entry.member} checked in after ${entry.hours}h: ${entry.topic}`, 'checkin', entry.member)
        await loadRoom()
      } catch (nextError) {
        setError(nextError.message)
      } finally {
        setSaving(false)
      }
    },
    [loadRoom, pushActivity, roomId, userId],
  )

  const updateSessions = useCallback(
    async (next, message, type) => {
      if (!roomId || !userId) return

      setSaving(true)
      setError('')

      try {
        const added = next.find((session) => !sessions.some((current) => current.id === session.id))
        if (added) {
          await insertSession({ actor: currentUser, roomId, session: added, userId })
        }

        await pushActivity(message, type)
        await loadRoom()
      } catch (nextError) {
        setError(nextError.message)
      } finally {
        setSaving(false)
      }
    },
    [currentUser, loadRoom, pushActivity, roomId, sessions, userId],
  )

  const updateNotes = useCallback(
    async (next, message, type) => {
      if (!roomId || !userId) return

      setSaving(true)
      setError('')

      try {
        const added = next.find((note) => !notes.some((current) => current.id === note.id))
        const removed = notes.find((note) => !next.some((current) => current.id === note.id))

        if (added) {
          await insertNote({ actor: currentUser, note: added, roomId, userId })
        } else if (removed) {
          await deleteNote(removed.id)
        }

        await pushActivity(message, type)
        await loadRoom()
      } catch (nextError) {
        setError(nextError.message)
      } finally {
        setSaving(false)
      }
    },
    [currentUser, loadRoom, notes, pushActivity, roomId, userId],
  )

  const updateEncouragements = useCallback(
    async (next, message, type) => {
      if (!roomId || !userId) return

      setSaving(true)
      setError('')

      try {
        const added = next.find((encouragement) => !encouragements.some((current) => current.id === encouragement.id))
        if (added) {
          await insertEncouragement({
            actor: currentUser,
            encouragement: added,
            roomId,
            userId,
          })
        }

        await pushActivity(message, type)
        await loadRoom()
      } catch (nextError) {
        setError(nextError.message)
      } finally {
        setSaving(false)
      }
    },
    [currentUser, encouragements, loadRoom, pushActivity, roomId, userId],
  )

  const handleFocusComplete = useCallback(
    async (durationMinutes) => {
      setPendingSession({ durationMinutes, completedAt: new Date().toISOString() })
      setError('')

      try {
        await pushActivity(`${currentUser} finished a ${durationMinutes}-minute focus session.`, 'focus', currentUser)
        await loadRoom()
      } catch (nextError) {
        setError(nextError.message)
      }
    },
    [currentUser, loadRoom, pushActivity],
  )

  const streak = computeCurrentStreak(checkins)
  const weekHours = getWeekHours(checkins)
  const weekProgress = Math.min(Math.round((weekHours / 20) * 100), 100)
  const openTasks = useMemo(() => tasks.filter((task) => task.status !== 'Done'), [tasks])
  const today = todayKey()
  const roomPulse = useMemo(() => {
    const todayCheckins = MEMBERS.map((member) =>
      checkins.find((checkin) => checkin.member === member && checkin.date === today),
    )
    const checkedInCount = todayCheckins.filter(Boolean).length
    const nextTask = openTasks
      .slice()
      .sort((first, second) => first.dueDate.localeCompare(second.dueDate))[0]

    return {
      checkedInCount,
      headline:
        checkedInCount === MEMBERS.length
          ? 'Both study lights are on today.'
          : `${MEMBERS.length - checkedInCount} gentle check-in left today.`,
      nextTask,
      todayCheckins,
    }
  }, [checkins, openTasks, today])
  const memberSummaries = useMemo(() => {
    return MEMBERS.map((member) => {
      const checkin = roomPulse.todayCheckins.find((entry) => entry?.member === member)
      const activeTasks = tasks.filter(
        (task) => task.status !== 'Done' && (task.owner === member || task.owner === 'Both'),
      ).length
      const latestSession = sessions.find((session) => session.member === member)

      return {
        member,
        activeTasks,
        checkin,
        latestSession,
      }
    })
  }, [roomPulse.todayCheckins, sessions, tasks])

  return (
    <main className="page-shell room-page">
      <section className="container">
        {error ? <p className="form-error">{error}</p> : null}
        {saving ? <p className="inline-alert">Saving to Supabase...</p> : null}
        <RoomMembershipPanel />
        <header className="room-header glass-card">
          <div>
            <span className="section-kicker">Private study room</span>
            <h1>{activeRoom?.name || 'Private Study Room'}</h1>
            <p>
              A quiet shared desk for two people: make one promise, leave a trace of effort, and keep
              each other steady.
            </p>
            <div className="room-pulse-row" aria-label="Room pulse">
              <span className="room-badge">
                <HeartHandshake size={15} />
                {roomPulse.headline}
              </span>
              <span className="room-badge">
                <Target size={15} />
                {openTasks.length ? `${openTasks.length} open next steps` : 'Task board is clear'}
              </span>
              <span className="room-badge warm">
                <Sparkles size={15} />
                {roomPulse.nextTask ? `Next: ${roomPulse.nextTask.title}` : 'Ready for a fresh goal'}
              </span>
            </div>
          </div>
          <div className="room-header-stats">
            <div>
              <Flame size={20} />
              <span>Shared streak</span>
              <strong>{streak} days</strong>
              <small>Keep one promise together</small>
            </div>
            <div>
              <Crown size={20} />
              <span>This week</span>
              <strong>{weekHours.toFixed(1)}h</strong>
              <small>{weekProgress}% of the cozy 20h goal</small>
            </div>
            <div>
              <BadgeCheck size={20} />
              <span>Today</span>
              <strong>
                {roomPulse.checkedInCount}/{MEMBERS.length}
              </strong>
              <small>Check-ins saved</small>
            </div>
          </div>
        </header>

        {dataLoading ? (
          <section className="glass-card room-card">
            <span className="section-kicker">Loading</span>
            <h2>Fetching your Supabase room...</h2>
            <p className="section-support">Tasks, check-ins, notes, and activity are loading from the database.</p>
          </section>
        ) : (
          <>
            <div className="member-row">
              {memberSummaries.map(({ activeTasks, checkin, latestSession, member }) => (
                <article
                  className={`room-member-card glass-card ${checkin ? 'is-present' : 'is-waiting'}`}
                  key={member}
                >
                  <UsersRound size={22} />
                  <div>
                    <div className="member-title-line">
                      <strong>{member}</strong>
                      <span className="room-badge mini">
                        {member === currentUser ? 'You are here' : 'Study partner'}
                      </span>
                    </div>
                    <span>{checkin ? `${checkin.hours}h logged today` : 'Waiting for a soft check-in'}</span>
                    <small>
                      {latestSession
                        ? `Last session: ${latestSession.subject}, ${latestSession.focusRating}/10 focus`
                        : 'No session report yet'}
                    </small>
                    <small>{activeTasks} active shared task{activeTasks === 1 ? '' : 's'}</small>
                  </div>
                </article>
              ))}
              <article className="room-member-card glass-card progress-member">
                <span>{weekProgress}%</span>
                <div>
                  <strong>Weekly progress</strong>
                  <span>20-hour shared target</span>
                  <small>Every honest block counts.</small>
                </div>
              </article>
            </div>

            <div className="room-main-grid">
              <div className="room-primary">
                <CheckInCard checkins={checkins} currentUser={currentUser} onSave={updateCheckins} />
                <TaskBoard tasks={tasks} onTasksChange={updateTasks} />
                <div className="two-column">
                  <FocusTimer onComplete={handleFocusComplete} />
                  <SessionFeedback
                    sessions={sessions}
                    currentUser={currentUser}
                    pendingSession={pendingSession}
                    onSessionsChange={updateSessions}
                    onClearPending={() => setPendingSession(null)}
                  />
                </div>
                <ProgressStats tasks={tasks} checkins={checkins} sessions={sessions} />
                <NotesBoard notes={notes} currentUser={currentUser} onNotesChange={updateNotes} />
                <MockAITools />
              </div>
              <div className="room-sidebar">
                <MotivationBox
                  encouragements={encouragements}
                  currentUser={currentUser}
                  onEncouragementsChange={updateEncouragements}
                />
                <ActivityFeed activity={activity} />
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default PrivateRoomPage
