import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Crown,
  LayoutDashboard,
  LockKeyhole,
  Sparkles,
  TimerReset,
} from 'lucide-react'
import FocusTimer from '../components/FocusTimer'
import MockAITools from '../components/MockAITools'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/useAuth'
import { fetchDashboardData } from '../data/supabaseData'
import { computeCurrentStreak, getAccountTypeLabel, isPrivateAccountType, isVipAccount, todayKey } from '../data/studyUtils'

const emptyDashboardData = {
  checkins: [],
  sessions: [],
  tasks: [],
}

const studentTasks = [
  { id: 'student-task-1', title: 'Review one hard topic', subject: 'Focus list', status: 'Todo' },
  { id: 'student-task-2', title: 'Finish a 25-minute sprint', subject: 'Timer', status: 'Doing' },
  { id: 'student-task-3', title: 'Write three memory notes', subject: 'Notes', status: 'Todo' },
]

function LockedFeatureCard({ title, detail }) {
  return (
    <article className="feature-lock-card">
      <LockKeyhole size={20} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
    </article>
  )
}

function StudentDashboard() {
  return (
    <main className="page-shell dashboard-page">
      <section className="container dashboard-grid">
        <div className="glass-card welcome-card">
          <span className="section-kicker">Student dashboard</span>
          <h1>Welcome back, Student</h1>
          <p>
            A basic study desk for personal momentum: plan a few tasks, run a focus sprint, keep
            limited notes, and use public Student rooms.
          </p>
          <div className="welcome-actions">
            <Link className="btn glow-btn" to="/rooms">
              Browse Student Rooms
            </Link>
            <Link className="btn soft-btn" to="/student">
              Student Tools
            </Link>
          </div>
        </div>

        <div className="dashboard-stats">
          <StatCard icon={CalendarCheck} label="Today" value="Ready" detail="Start with one task" accent="green" />
          <StatCard icon={CheckCircle2} label="Personal tasks" value={studentTasks.length} detail="Local plan preview" accent="blue" />
          <StatCard icon={Sparkles} label="AI tools" value="Limited" detail="Mock helpers only" accent="pink" />
          <StatCard icon={Clock3} label="Focus" value="25m" detail="Basic timer unlocked" accent="amber" />
        </div>

        <section className="glass-card dashboard-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Personal tasks</span>
              <h2>Basic study plan</h2>
            </div>
            <TimerReset size={22} aria-hidden="true" />
          </div>
          <div className="compact-list">
            {studentTasks.map((task) => (
              <article key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.subject}</span>
                </div>
                <span className={`status-chip status-${task.status.toLowerCase()}`}>{task.status}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-card dashboard-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Limited notes</span>
              <h2>Scratchpad preview</h2>
            </div>
            <LayoutDashboard size={22} aria-hidden="true" />
          </div>
          <p className="empty-state">
            Save full shared and private notes inside room experiences. Student mode keeps this
            simple so the desk stays light.
          </p>
        </section>

        <div className="dashboard-wide split-feature-row">
          <FocusTimer />
          <section className="glass-card room-card">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Locked upgrades</span>
                <h2>Private features wait behind real plans</h2>
              </div>
              <LockKeyhole size={24} aria-hidden="true" />
            </div>
            <div className="feature-lock-grid">
              <LockedFeatureCard title="Couples private room" detail="Shared check-ins, partner progress, motivation." />
              <LockedFeatureCard title="VIP suite" detail="Advanced mock AI, previews, analytics, themes." />
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

function DashboardPage() {
  const { accountType, accountTypeLabel, activeRoom, authConfigured, error: authError, loading, roomLoading, user } = useAuth()
  const privateAccount = isPrivateAccountType(accountType)
  const roomId = privateAccount && activeRoom?.roomType === accountType ? activeRoom?.id : null
  const [dashboardData, setDashboardData] = useState(emptyDashboardData)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!roomId) {
      return
    }

    let mounted = true

    Promise.resolve().then(async () => {
      setDataLoading(true)
      setError('')

      try {
        const data = await fetchDashboardData(roomId)
        if (!mounted) return
        setDashboardData(data)
      } catch (nextError) {
        if (!mounted) return
        setError(nextError.message)
      } finally {
        if (mounted) {
          setDataLoading(false)
        }
      }
    })

    return () => {
      mounted = false
    }
  }, [roomId])

  const { checkins, sessions, tasks } = roomId ? dashboardData : emptyDashboardData
  const today = todayKey()
  const currentLabel = getAccountTypeLabel(accountType)
  const visibleTasks = useMemo(() => {
    return tasks
      .filter((task) => task.owner === currentLabel || task.owner === 'Both')
      .slice(0, 4)
  }, [currentLabel, tasks])
  const todayCheckin = checkins.find((checkin) => checkin.member === currentLabel && checkin.date === today)
  const completedTasks = tasks.filter((task) => task.status === 'Done').length
  const streak = computeCurrentStreak(checkins)
  const privateReady = Boolean(user && privateAccount && activeRoom?.roomType === accountType)
  const busy = loading || roomLoading || dataLoading
  const vip = isVipAccount(accountType)

  if (accountType === 'student') {
    return <StudentDashboard />
  }

  return (
    <main className="page-shell dashboard-page">
      <section className="container dashboard-grid">
        <div className="glass-card welcome-card">
          <span className="section-kicker">{accountTypeLabel} dashboard</span>
          <h1>Welcome back, {accountTypeLabel}</h1>
          <p>
            {vip
              ? 'Your premium dashboard gathers room management, previews, advanced mock AI, and customization shortcuts.'
              : 'Your couples dashboard keeps the shared room, partner progress, and study rituals close at hand.'}
          </p>
          {!authConfigured ? <p className="form-error">{authError}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
          {busy ? <p className="inline-alert">Loading Supabase data...</p> : null}
          <div className="welcome-actions">
            <Link className="btn glow-btn" to="/our-room">
              {privateReady ? 'Go to Private Room' : vip ? 'Create VIP Room' : 'Create Couples Private Room'}
            </Link>
            <Link className="btn soft-btn" to="/rooms">
              Rooms Directory
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
            detail={`${tasks.length} total room tasks`}
            accent="blue"
          />
          <StatCard icon={Sparkles} label="Study streak" value={`${streak}d`} detail="Shared room rhythm" accent="pink" />
          <StatCard
            icon={Crown}
            label={vip ? 'VIP tools' : 'Couples tools'}
            value={vip ? 'All' : 'Shared'}
            detail={vip ? 'Previews and analytics' : 'Couples room rituals'}
            accent="amber"
          />
        </div>

        <section className="glass-card dashboard-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Room tasks</span>
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
              <p className="empty-state">
                {privateReady ? 'No tasks yet. Add one in the private room.' : 'Create your room to load private tasks.'}
              </p>
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
              <p className="empty-state">
                {privateReady ? 'No sessions yet. Complete a focus sprint first.' : 'Session reports appear after room setup.'}
              </p>
            )}
          </div>
        </section>

        <section className={`glass-card private-preview ${privateReady ? '' : 'locked'}`}>
          <LockKeyhole size={28} aria-hidden="true" />
          <div>
            <h2>{privateReady ? activeRoom.name : `${accountTypeLabel} room setup is waiting`}</h2>
            <p>
              {privateReady
                ? 'Use the room for check-ins, shared tasks, notes, mock AI tools, and activity tracking.'
                : 'Open Our Room to create the secure room for this account type.'}
            </p>
          </div>
          <Link className="btn glow-btn" to="/our-room">
            {privateReady ? 'Enter Room' : 'Set Up Room'}
          </Link>
        </section>

        {vip ? (
          <div className="dashboard-wide split-feature-row">
            <MockAITools />
            <section className="glass-card room-card">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">VIP previews</span>
                  <h2>Inspect page designs safely</h2>
                </div>
                <Crown size={24} aria-hidden="true" />
              </div>
              <div className="feature-lock-grid">
                <Link className="feature-lock-card" to="/student-preview">
                  <Sparkles size={20} aria-hidden="true" />
                  <div>
                    <strong>Student preview</strong>
                    <span>Sample data only.</span>
                  </div>
                </Link>
                <Link className="feature-lock-card" to="/couples-preview">
                  <Sparkles size={20} aria-hidden="true" />
                  <div>
                    <strong>Couples preview</strong>
                    <span>No private room rows are read.</span>
                  </div>
                </Link>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default DashboardPage
