import { Link } from 'react-router-dom'
import { CalendarCheck, CheckCircle2, Clock3, LockKeyhole, Sparkles, TimerReset } from 'lucide-react'
import StatCard from '../components/StatCard'
import {
  STORAGE_KEYS,
  canEnterPrivateRoom,
  computeCurrentStreak,
  ensureDemoData,
  getStoredUser,
  readStorage,
  todayKey,
} from '../data/storage'

function DashboardPage() {
  ensureDemoData()

  const user = getStoredUser()
  const tasks = readStorage(STORAGE_KEYS.tasks, [])
  const checkins = readStorage(STORAGE_KEYS.checkins, [])
  const sessions = readStorage(STORAGE_KEYS.sessions, [])
  const today = todayKey()
  const isGuest = user === 'Guest'
  const visibleTasks = isGuest
    ? tasks.slice(0, 3)
    : tasks.filter((task) => task.owner === user || task.owner === 'Both').slice(0, 4)
  const todayCheckin = checkins.find((checkin) => checkin.member === user && checkin.date === today)
  const completedTasks = tasks.filter((task) => task.status === 'Done').length
  const streak = computeCurrentStreak(checkins)
  const privateReady = canEnterPrivateRoom(user)

  return (
    <main className="page-shell dashboard-page">
      <section className="container dashboard-grid">
        <div className="glass-card welcome-card">
          <span className="section-kicker">Dashboard</span>
          <h1>Welcome back, {user}</h1>
          <p>
            {isGuest
              ? 'You are viewing a limited public demo. Choose Magic or Partner and enter the passcode to open the private room.'
              : 'Your study room is ready. Check the day, pick the next task, and start a focused session.'}
          </p>
          <div className="welcome-actions">
            <Link className="btn glow-btn" to={privateReady ? '/our-room' : '/access'}>
              {privateReady ? 'Go to Private Room' : 'Unlock Private Room'}
            </Link>
            <Link className="btn soft-btn" to="/features">
              Explore Features
            </Link>
          </div>
        </div>

        <div className="dashboard-stats">
          <StatCard
            icon={CalendarCheck}
            label="Today"
            value={todayCheckin ? `${todayCheckin.hours}h` : 'No check-in'}
            detail={todayCheckin ? todayCheckin.topic : 'Add one in the private room'}
            accent="green"
          />
          <StatCard
            icon={CheckCircle2}
            label="Tasks done"
            value={completedTasks}
            detail={`${tasks.length} total tasks`}
            accent="blue"
          />
          <StatCard icon={Sparkles} label="Study streak" value={`${streak}d`} detail="Shared room preview" accent="pink" />
          <StatCard
            icon={Clock3}
            label="Recent sessions"
            value={sessions.length}
            detail="Reports saved"
            accent="amber"
          />
        </div>

        <section className="glass-card dashboard-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Personal tasks</span>
              <h2>Next on the board</h2>
            </div>
            <TimerReset size={22} aria-hidden="true" />
          </div>
          <div className="compact-list">
            {visibleTasks.length ? (
              visibleTasks.map((task) => (
                <article key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <span>
                      {task.subject} - {task.owner}
                    </span>
                  </div>
                  <span className={`status-chip status-${task.status.toLowerCase()}`}>{task.status}</span>
                </article>
              ))
            ) : (
              <p className="empty-state">No tasks yet.</p>
            )}
          </div>
        </section>

        <section className="glass-card dashboard-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Recent sessions</span>
              <h2>Feedback preview</h2>
            </div>
            <Sparkles size={22} aria-hidden="true" />
          </div>
          <div className="compact-list">
            {sessions.length ? (
              sessions.slice(0, 3).map((session) => (
                <article key={session.id}>
                  <div>
                    <strong>{session.subject}</strong>
                    <span>
                      {session.member} - {session.durationMinutes} min
                    </span>
                  </div>
                  <span>{session.focusRating}/10</span>
                </article>
              ))
            ) : (
              <p className="empty-state">No sessions yet. Complete a focus sprint to see reports here.</p>
            )}
          </div>
        </section>

        <section className={`glass-card private-preview ${isGuest ? 'locked' : ''}`}>
          <LockKeyhole size={28} aria-hidden="true" />
          <div>
            <h2>{isGuest ? 'Private room locked for guests' : 'Magic & Partner room'}</h2>
            <p>
              {isGuest
                ? 'Guest mode can explore the public dashboard, but the private room needs Magic or Partner access.'
                : 'Use the room for check-ins, shared tasks, notes, mock AI tools, and activity tracking.'}
            </p>
          </div>
          <Link className="btn glow-btn" to={privateReady ? '/our-room' : '/access'}>
            {privateReady ? 'Enter Room' : 'Open Access'}
          </Link>
        </section>
      </section>
    </main>
  )
}

export default DashboardPage
