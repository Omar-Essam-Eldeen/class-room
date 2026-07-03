import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, CheckCircle2, Clock3, LockKeyhole, Sparkles, TimerReset } from 'lucide-react'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/useAuth'
import { fetchDashboardData } from '../data/supabaseData'
import { computeCurrentStreak, isPrivateAccountType, todayKey } from '../data/studyUtils'

const emptyDashboardData = {
  checkins: [],
  sessions: [],
  tasks: [],
}

function DashboardPage() {
  const { accountType, activeRoom, authConfigured, error: authError, loading, roomLoading, user } = useAuth()
  const privateAccount = isPrivateAccountType(accountType)
  const roomId = privateAccount ? activeRoom?.id : null
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

  const displayData = roomId ? dashboardData : emptyDashboardData
  const { checkins, sessions, tasks } = displayData
  const today = todayKey()
  const signedOut = !user
  const studentMode = signedOut || !privateAccount
  const visibleTasks = useMemo(() => {
    if (studentMode) return []

    return tasks
      .filter((task) => task.owner === accountType || task.owner === 'Both')
      .slice(0, 4)
  }, [accountType, studentMode, tasks])
  const todayCheckin = checkins.find((checkin) => checkin.member === accountType && checkin.date === today)
  const completedTasks = tasks.filter((task) => task.status === 'Done').length
  const streak = computeCurrentStreak(checkins)
  const privateReady = Boolean(user && privateAccount && activeRoom)
  const busy = loading || roomLoading || dataLoading

  return (
    <main className="page-shell dashboard-page">
      <section className="container dashboard-grid">
        <div className="glass-card welcome-card">
          <span className="section-kicker">Dashboard</span>
          <h1>Welcome back, {signedOut ? 'Student' : accountType}</h1>
          <p>
            {signedOut
              ? 'You are viewing the public study dashboard. Sign in to save a profile and manage private room access.'
              : privateAccount
                ? 'Your study profile is connected to Supabase. Check the day, pick the next task, and start a focused session.'
                : 'Your Student profile can use public study pages and dashboard previews. Private rooms unlock with Couples or VIP.'}
          </p>
          {!authConfigured ? <p className="form-error">{authError}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
          {busy ? <p className="inline-alert">Loading Supabase data...</p> : null}
          <div className="welcome-actions">
            <Link className="btn glow-btn" to={signedOut ? '/access' : '/our-room'}>
              {privateReady ? 'Go to Private Room' : signedOut ? 'Sign In to Save Progress' : 'Check Room Access'}
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
          <StatCard icon={Sparkles} label="Study streak" value={`${streak}d`} detail="Shared room rhythm" accent="pink" />
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
              <p className="empty-state">
                {studentMode ? 'Private tasks appear for Couples and VIP rooms.' : 'No tasks yet. Add one in the private room.'}
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
                {studentMode ? 'Private session reports appear after room access.' : 'No sessions yet. Complete a focus sprint first.'}
              </p>
            )}
          </div>
        </section>

        <section className={`glass-card private-preview ${privateReady ? '' : 'locked'}`}>
          <LockKeyhole size={28} aria-hidden="true" />
          <div>
            <h2>
              {privateReady
                ? activeRoom.name
                : privateAccount
                  ? 'Private room setup is waiting'
                  : 'Private rooms are for Couples and VIP'}
            </h2>
            <p>
              {privateReady
                ? 'Use the room for check-ins, shared tasks, notes, mock AI tools, and activity tracking.'
                : privateAccount
                  ? 'Open Our Room to create your Supabase-backed private study space.'
                  : 'Stay in Student mode for public pages, or switch to Couples/VIP from Access when you want a private room.'}
            </p>
          </div>
          <Link className="btn glow-btn" to={privateReady || user ? '/our-room' : '/access'}>
            {privateReady ? 'Enter Room' : user ? 'View Room Status' : 'Open Access'}
          </Link>
        </section>
      </section>
    </main>
  )
}

export default DashboardPage
