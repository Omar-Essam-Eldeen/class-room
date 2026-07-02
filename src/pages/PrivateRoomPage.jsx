import { useCallback, useMemo, useState } from 'react'
import { BadgeCheck, Crown, Flame, HeartHandshake, Sparkles, Target, UsersRound } from 'lucide-react'
import ActivityFeed from '../components/ActivityFeed'
import CheckInCard from '../components/CheckInCard'
import FocusTimer from '../components/FocusTimer'
import MockAITools from '../components/MockAITools'
import MotivationBox from '../components/MotivationBox'
import NotesBoard from '../components/NotesBoard'
import ProgressStats from '../components/ProgressStats'
import SessionFeedback from '../components/SessionFeedback'
import TaskBoard from '../components/TaskBoard'
import {
  MEMBERS,
  STORAGE_KEYS,
  computeCurrentStreak,
  createActivity,
  ensureDemoData,
  getStoredUser,
  getWeekHours,
  readStorage,
  todayKey,
  writeStorage,
} from '../data/storage'

function PrivateRoomPage() {
  const currentUser = getStoredUser()
  const [tasks, setTasks] = useState(() => {
    ensureDemoData()
    return readStorage(STORAGE_KEYS.tasks, [])
  })
  const [checkins, setCheckins] = useState(() => readStorage(STORAGE_KEYS.checkins, []))
  const [sessions, setSessions] = useState(() => readStorage(STORAGE_KEYS.sessions, []))
  const [notes, setNotes] = useState(() => readStorage(STORAGE_KEYS.notes, []))
  const [encouragements, setEncouragements] = useState(() =>
    readStorage(STORAGE_KEYS.encouragements, []),
  )
  const [activity, setActivity] = useState(() => readStorage(STORAGE_KEYS.activity, []))
  const [pendingSession, setPendingSession] = useState(null)

  const pushActivity = useCallback(
    (message, type = 'update', actor = currentUser) => {
      const entry = createActivity(message, type, actor)
      setActivity((current) => {
        const next = [entry, ...current].slice(0, 32)
        writeStorage(STORAGE_KEYS.activity, next)
        return next
      })
    },
    [currentUser],
  )

  const updateTasks = useCallback(
    (next, message, type) => {
      setTasks(next)
      writeStorage(STORAGE_KEYS.tasks, next)
      pushActivity(message, type)
    },
    [pushActivity],
  )

  const updateCheckins = useCallback(
    (next, entry) => {
      setCheckins(next)
      writeStorage(STORAGE_KEYS.checkins, next)
      pushActivity(`${entry.member} checked in after ${entry.hours}h: ${entry.topic}`, 'checkin', entry.member)
    },
    [pushActivity],
  )

  const updateSessions = useCallback(
    (next, message, type) => {
      setSessions(next)
      writeStorage(STORAGE_KEYS.sessions, next)
      pushActivity(message, type)
    },
    [pushActivity],
  )

  const updateNotes = useCallback(
    (next, message, type) => {
      setNotes(next)
      writeStorage(STORAGE_KEYS.notes, next)
      pushActivity(message, type)
    },
    [pushActivity],
  )

  const updateEncouragements = useCallback(
    (next, message, type) => {
      setEncouragements(next)
      writeStorage(STORAGE_KEYS.encouragements, next)
      pushActivity(message, type)
    },
    [pushActivity],
  )

  const handleFocusComplete = useCallback(
    (durationMinutes) => {
      setPendingSession({ durationMinutes, completedAt: new Date().toISOString() })
      pushActivity(`${currentUser} finished a ${durationMinutes}-minute focus session.`, 'focus', currentUser)
    },
    [currentUser, pushActivity],
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
        <header className="room-header glass-card">
          <div>
            <span className="section-kicker">Private study room</span>
            <h1>Magic & Partner's Class Room</h1>
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
      </section>
    </main>
  )
}

export default PrivateRoomPage
