import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpenCheck, CheckCircle2, LockKeyhole, NotebookPen, Plus, TimerReset } from 'lucide-react'
import FocusTimer from '../components/FocusTimer'
import MockAITools from '../components/MockAITools'
import StatCard from '../components/StatCard'

const starterTasks = [
  { id: 'student-task-1', done: false, title: 'Review one hard topic' },
  { id: 'student-task-2', done: true, title: 'Finish a 25-minute sprint' },
  { id: 'student-task-3', done: false, title: 'Write three memory notes' },
]

function StudentPage() {
  const [tasks, setTasks] = useState(starterTasks)
  const [taskTitle, setTaskTitle] = useState('')
  const [note, setNote] = useState('')
  const [checkedIn, setCheckedIn] = useState(false)
  const completedTasks = tasks.filter((task) => task.done).length

  const addTask = (event) => {
    event.preventDefault()
    if (!taskTitle.trim()) return
    setTasks((current) => [{ id: crypto.randomUUID(), done: false, title: taskTitle.trim() }, ...current])
    setTaskTitle('')
  }

  const toggleTask = (taskId) => {
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task)))
  }

  return (
    <main className="page-shell dashboard-page">
      <section className="container dashboard-grid">
        <div className="glass-card welcome-card">
          <span className="section-kicker">Student desk</span>
          <h1>Personal study tools, kept useful.</h1>
          <p>
            Student accounts get a focused personal workspace: tasks, check-in, scratchpad, timer,
            progress preview, public rooms, and a limited local AI helper.
          </p>
          <div className="welcome-actions">
            <Link className="btn glow-btn" to="/rooms">
              Find Student Rooms
            </Link>
            <Link className="btn soft-btn" to="/dashboard">
              Dashboard
            </Link>
          </div>
        </div>

        <div className="dashboard-stats">
          <StatCard icon={TimerReset} label="Focus" value="Basic" detail="25, 45, 60 minute sprints" accent="green" />
          <StatCard icon={NotebookPen} label="Scratchpad" value={note ? 'Saved' : 'Empty'} detail="Local session notes" accent="blue" />
          <StatCard icon={CheckCircle2} label="Tasks done" value={`${completedTasks}/${tasks.length}`} detail="Personal checklist" accent="amber" />
          <StatCard icon={BookOpenCheck} label="Streak preview" value={checkedIn ? '1d' : '0d'} detail="Check in to start" accent="pink" />
        </div>

        <section className="glass-card dashboard-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Personal tasks</span>
              <h2>Today's small promises</h2>
            </div>
            <CheckCircle2 size={22} aria-hidden="true" />
          </div>
          <form className="student-tool-form" onSubmit={addTask}>
            <input
              className="form-control"
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Add one personal task"
              aria-label="Student task"
            />
            <button className="btn glow-btn" type="submit">
              <Plus size={16} />
              Add
            </button>
          </form>
          <div className="compact-list">
            {tasks.map((task) => (
              <article key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.done ? 'Finished with proof' : 'Waiting for focus'}</span>
                </div>
                <button className="btn soft-btn" type="button" onClick={() => toggleTask(task.id)}>
                  {task.done ? 'Undo' : 'Done'}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-card dashboard-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Daily check-in</span>
              <h2>{checkedIn ? 'You showed up today' : 'Start your streak'}</h2>
            </div>
            <BookOpenCheck size={22} aria-hidden="true" />
          </div>
          <p className="section-support">
            A basic Student check-in gives you points and keeps the study habit visible.
          </p>
          <button className="btn glow-btn" type="button" onClick={() => setCheckedIn(true)} disabled={checkedIn}>
            {checkedIn ? 'Checked In' : 'Check In Today'}
          </button>
        </section>

        <div className="dashboard-wide split-feature-row">
          <FocusTimer />
          <section className="glass-card room-card">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Simple notes</span>
                <h2>Scratchpad</h2>
              </div>
              <NotebookPen size={24} aria-hidden="true" />
            </div>
            <textarea
              className="form-control"
              rows="8"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Write a formula, reminder, or stuck question..."
            />
          </section>
        </div>

        <div className="dashboard-wide split-feature-row">
          <MockAITools />
          <section className="glass-card room-card">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Upgrade boundaries</span>
                <h2>What stays locked</h2>
              </div>
              <LockKeyhole size={24} aria-hidden="true" />
            </div>
            <div className="feature-lock-grid">
              <article className="feature-lock-card">
                <LockKeyhole size={20} aria-hidden="true" />
                <div>
                  <strong>Couples private room</strong>
                  <span>Shared check-ins, partner progress, and encouragement.</span>
                </div>
              </article>
              <article className="feature-lock-card">
                <LockKeyhole size={20} aria-hidden="true" />
                <div>
                  <strong>VIP suite</strong>
                  <span>Advanced mock AI, previews, analytics, and theme controls.</span>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

export default StudentPage
