import { useMemo, useState } from 'react'
import { MessageSquareText, Save, TrendingUp } from 'lucide-react'
import { createId, formatTime } from '../data/studyUtils'

function SessionFeedback({ sessions, currentUser, pendingSession, onSessionsChange, onClearPending }) {
  const [form, setForm] = useState({
    subject: '',
    durationMinutes: '',
    focusRating: '8',
    wentWell: '',
    difficult: '',
  })
  const [error, setError] = useState('')
  const [durationTouched, setDurationTouched] = useState(false)
  const durationValue =
    durationTouched || form.durationMinutes !== ''
      ? form.durationMinutes
      : pendingSession
        ? String(pendingSession.durationMinutes)
        : ''
  const sessionSummary = useMemo(() => {
    const recentSessions = sessions.slice(0, 6)
    const totalMinutes = recentSessions.reduce(
      (total, session) => total + Number(session.durationMinutes || 0),
      0,
    )
    const averageFocus = recentSessions.length
      ? Math.round(
          recentSessions.reduce((total, session) => total + Number(session.focusRating || 0), 0) /
            recentSessions.length,
        )
      : 0

    return { averageFocus, totalMinutes }
  }, [sessions])

  const updateField = (field, value) => {
    if (field === 'durationMinutes') {
      setDurationTouched(true)
    }

    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const duration = Number(durationValue)
    const rating = Number(form.focusRating)

    if (!form.subject.trim() || !form.wentWell.trim() || !form.difficult.trim()) {
      setError('Subject, wins, and difficulty notes are required.')
      return
    }

    if (Number.isNaN(duration) || duration <= 0) {
      setError('Session duration must be greater than zero.')
      return
    }

    const session = {
      id: createId('session'),
      member: currentUser,
      subject: form.subject.trim(),
      durationMinutes: duration,
      focusRating: rating,
      wentWell: form.wentWell.trim(),
      difficult: form.difficult.trim(),
      createdAt: new Date().toISOString(),
    }

    onSessionsChange(
      [session, ...sessions],
      `${currentUser} saved a ${duration}-minute ${session.subject} session.`,
      'session',
    )
    setForm({ subject: '', durationMinutes: '', focusRating: '8', wentWell: '', difficult: '' })
    setDurationTouched(false)
    onClearPending()
  }

  return (
    <section className="glass-card room-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Session feedback</span>
          <h2>Turn effort into insight</h2>
          <p className="section-support">
            Save what worked and what felt hard so tomorrow's plan starts kinder and smarter.
          </p>
        </div>
        <MessageSquareText size={24} aria-hidden="true" />
      </div>

      {pendingSession ? (
        <div className="inline-alert">
          Focus sprint complete. Capture the win while it is still warm.
        </div>
      ) : null}

      <div className="session-snapshot">
        <span className="room-badge">
          <TrendingUp size={15} />
          Recent focus {sessionSummary.averageFocus || '-'} / 10
        </span>
        <span className="room-badge warm">{sessionSummary.totalMinutes} recent minutes protected</span>
      </div>

      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-5">
          <label className="form-label" htmlFor="session-subject">
            Subject studied
          </label>
          <input
            id="session-subject"
            className="form-control"
            value={form.subject}
            onChange={(event) => updateField('subject', event.target.value)}
            placeholder="Biology, math, history..."
          />
        </div>
        <div className="col-6 col-md-3">
          <label className="form-label" htmlFor="session-duration">
            Minutes
          </label>
          <input
            id="session-duration"
            className="form-control"
            type="number"
            min="1"
            value={durationValue}
            onChange={(event) => updateField('durationMinutes', event.target.value)}
          />
        </div>
        <div className="col-6 col-md-4">
          <label className="form-label" htmlFor="session-rating">
            Focus rating 1-10
          </label>
          <input
            id="session-rating"
            className="form-range"
            type="range"
            min="1"
            max="10"
            value={form.focusRating}
            onChange={(event) => updateField('focusRating', event.target.value)}
          />
          <span className="range-value">{form.focusRating}/10</span>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="session-well">
            What went well?
          </label>
          <textarea
            id="session-well"
            className="form-control"
            rows="3"
            value={form.wentWell}
            onChange={(event) => updateField('wentWell', event.target.value)}
            placeholder="A small win, a solved problem, or a moment you stayed with it..."
          />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="session-hard">
            What was difficult?
          </label>
          <textarea
            id="session-hard"
            className="form-control"
            rows="3"
            value={form.difficult}
            onChange={(event) => updateField('difficult', event.target.value)}
            placeholder="A stuck point your partner can help you untangle..."
          />
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="col-12">
          <button className="btn glow-btn" type="submit">
            <Save size={17} />
            Save Session Report
          </button>
        </div>
      </form>

      <div className="recent-list">
        <h3>Recent reports</h3>
        {sessions.length ? (
          sessions.slice(0, 4).map((session) => (
            <article className="session-report" key={session.id}>
              <div>
                <strong>{session.subject}</strong>
                <span>
                  {session.member} - {session.durationMinutes} min - {session.focusRating}/10
                </span>
              </div>
              <p>
                <strong>Win:</strong> {session.wentWell}
              </p>
              <p>
                <strong>Stuck point:</strong> {session.difficult}
              </p>
              <small>{formatTime(session.createdAt)}</small>
            </article>
          ))
        ) : (
          <p className="empty-state">No reports yet. Finish one sprint, then leave a kind breadcrumb.</p>
        )}
      </div>
    </section>
  )
}

export default SessionFeedback
