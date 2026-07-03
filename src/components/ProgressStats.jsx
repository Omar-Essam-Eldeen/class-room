import { BarChart3, CheckCircle2, Clock3, Flame, NotebookTabs, Target } from 'lucide-react'
import StatCard from './StatCard'
import { computeCurrentStreak, getWeekHours } from '../data/studyUtils'

function ProgressStats({ tasks, checkins, sessions }) {
  const completedTasks = tasks.filter((task) => task.status === 'Done').length
  const totalHours = checkins.reduce((total, checkin) => total + Number(checkin.hours || 0), 0)
  const streak = computeCurrentStreak(checkins)
  const weekHours = getWeekHours(checkins)
  const taskProgress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0
  const weekProgress = Math.min(Math.round((weekHours / 20) * 100), 100)

  return (
    <section className="glass-card room-card">
      <div className="section-heading flush-heading">
        <div>
          <span className="section-kicker">Progress stats</span>
          <h2>Small wins, made visible</h2>
          <p className="section-support">
            This is proof that the room is moving, even when the day feels quiet.
          </p>
        </div>
        <BarChart3 size={24} aria-hidden="true" />
      </div>
      <div className="stats-grid">
        <StatCard
          icon={CheckCircle2}
          label="Completed tasks"
          value={completedTasks}
          detail={`${taskProgress}% of the shared board`}
          accent="green"
        />
        <StatCard
          icon={Clock3}
          label="Study hours"
          value={`${totalHours.toFixed(1)}h`}
          detail={`${weekHours.toFixed(1)}h protected this week`}
          accent="amber"
        />
        <StatCard
          icon={NotebookTabs}
          label="Check-ins"
          value={checkins.length}
          detail="Honest daily traces"
          accent="blue"
        />
        <StatCard icon={Flame} label="Current streak" value={`${streak}d`} detail="Shared rhythm held" accent="pink" />
        <StatCard
          icon={Target}
          label="Sessions"
          value={sessions.length}
          detail="Reports turned into insight"
          accent="purple"
        />
      </div>

      <div className="progress-stack glass-card">
        <div>
          <span>Task completion</span>
          <strong>{taskProgress}%</strong>
        </div>
        <div className="progress">
          <div className="progress-bar success" style={{ width: `${taskProgress}%` }} />
        </div>
        <div>
          <span>Weekly 20-hour goal</span>
          <strong>{weekProgress}%</strong>
        </div>
        <div className="progress">
          <div className="progress-bar warm" style={{ width: `${weekProgress}%` }} />
        </div>
      </div>
    </section>
  )
}

export default ProgressStats
