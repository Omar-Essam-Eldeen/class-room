import { useMemo, useState } from 'react'
import { CalendarDays, Circle, ListPlus, Trash2 } from 'lucide-react'
import { MEMBERS, createId, formatShortDate } from '../data/storage'

const owners = [...MEMBERS, 'Both']
const priorities = ['Low', 'Medium', 'High']
const statuses = ['Todo', 'Doing', 'Done']
const statusDetails = {
  Todo: {
    label: 'Plan gently',
    empty: 'Nothing waiting here. Add one tiny promise for the room.',
  },
  Doing: {
    label: 'Held in focus',
    empty: 'No active sprint yet. Choose one task and let it be enough.',
  },
  Done: {
    label: 'Proof of effort',
    empty: 'Finished wins will collect here after the next brave checkbox.',
  },
}

function TaskBoard({ tasks, onTasksChange }) {
  const [form, setForm] = useState({
    title: '',
    owner: 'Both',
    subject: '',
    priority: 'Medium',
    dueDate: '',
  })
  const [error, setError] = useState('')

  const completedCount = tasks.filter((task) => task.status === 'Done').length
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0

  const tasksByStatus = useMemo(() => {
    return statuses.reduce((groups, status) => {
      groups[status] = tasks.filter((task) => task.status === status)
      return groups
    }, {})
  }, [tasks])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.title.trim() || !form.subject.trim() || !form.dueDate) {
      setError('Task title, subject, and due date are required.')
      return
    }

    const task = {
      id: createId('task'),
      title: form.title.trim(),
      owner: form.owner,
      subject: form.subject.trim(),
      priority: form.priority,
      dueDate: form.dueDate,
      status: 'Todo',
      createdAt: new Date().toISOString(),
    }

    onTasksChange([task, ...tasks], `${task.owner} added "${task.title}" to shared tasks.`, 'task')
    setForm({ title: '', owner: 'Both', subject: '', priority: 'Medium', dueDate: '' })
  }

  const changeStatus = (task, status) => {
    const next = tasks.map((item) => (item.id === task.id ? { ...item, status } : item))
    const message =
      status === 'Done' && task.status !== 'Done'
        ? `${task.owner} completed "${task.title}".`
        : `"${task.title}" moved to ${status}.`
    onTasksChange(next, message, 'task')
  }

  const deleteTask = (task) => {
    const next = tasks.filter((item) => item.id !== task.id)
    onTasksChange(next, `"${task.title}" was removed from the task board.`, 'task')
  }

  return (
    <section className="glass-card room-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Shared tasks</span>
          <h2>Keep the next step visible</h2>
          <p className="section-support">
            A shared board for the promise you are holding together, not a place to pile pressure.
          </p>
        </div>
        <div className="progress-ring" aria-label={`${progress} percent complete`}>
          {progress}%
        </div>
      </div>

      <form className="task-form" onSubmit={handleSubmit}>
        <input
          className="form-control"
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          placeholder="One clear next step"
          aria-label="Task title"
        />
        <select
          className="form-select"
          value={form.owner}
          onChange={(event) => updateField('owner', event.target.value)}
          aria-label="Task owner"
        >
          {owners.map((owner) => (
            <option key={owner}>{owner}</option>
          ))}
        </select>
        <input
          className="form-control"
          value={form.subject}
          onChange={(event) => updateField('subject', event.target.value)}
          placeholder="Subject or goal"
          aria-label="Subject"
        />
        <select
          className="form-select"
          value={form.priority}
          onChange={(event) => updateField('priority', event.target.value)}
          aria-label="Priority"
        >
          {priorities.map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>
        <input
          className="form-control"
          type="date"
          value={form.dueDate}
          onChange={(event) => updateField('dueDate', event.target.value)}
          aria-label="Due date"
        />
        <button className="btn glow-btn" type="submit">
          <ListPlus size={17} />
          Add
        </button>
      </form>
      {error ? <p className="form-error">{error}</p> : null}

      <div className="task-progress">
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <span>
          {completedCount} of {tasks.length} complete. Shared load is {progress}% lighter.
        </span>
      </div>

      <div className="task-board">
        {statuses.map((status) => (
          <div className="task-column" key={status}>
            <div className="task-column-title">
              <div>
                <Circle size={12} />
                <span>{status}</span>
              </div>
              <span className="room-badge mini">{tasksByStatus[status].length}</span>
            </div>
            <p className="task-column-copy">{statusDetails[status].label}</p>
            {tasksByStatus[status].length ? (
              tasksByStatus[status].map((task) => (
                <article className="task-card" key={task.id}>
                  <div className="task-card-top">
                    <strong>{task.title}</strong>
                    <button
                      className="icon-btn"
                      type="button"
                      aria-label={`Delete ${task.title}`}
                      onClick={() => deleteTask(task)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="task-meta">
                    <span>{task.owner}</span>
                    <span>{task.subject}</span>
                    <span className={`priority priority-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="task-due">
                    <CalendarDays size={15} />
                    Due {formatShortDate(task.dueDate)}
                  </div>
                  <p className="task-card-note">
                    {task.owner === 'Both'
                      ? 'A together task. Meet in the middle.'
                      : `${task.owner} is carrying this one.`}
                  </p>
                  <select
                    className="form-select form-select-sm"
                    value={task.status}
                    onChange={(event) => changeStatus(task, event.target.value)}
                    aria-label={`Change status for ${task.title}`}
                  >
                    {statuses.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </article>
              ))
            ) : (
              <p className="empty-state">{statusDetails[status].empty}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default TaskBoard
