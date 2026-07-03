import { useMemo, useState } from 'react'
import { CheckCircle2, HeartPulse, Save, SmilePlus } from 'lucide-react'
import { MEMBERS, createId, todayKey } from '../data/studyUtils'

const moods = ['Focused', 'Happy', 'Tired', 'Stressed', 'Motivated']
const moodNotes = {
  Focused: 'steady lamp energy',
  Happy: 'light desk mood',
  Tired: 'gentle pace today',
  Stressed: 'soft landing needed',
  Motivated: 'momentum is warm',
}

function CheckInCard({ checkins, currentUser, onSave }) {
  const [form, setForm] = useState({
    member: MEMBERS.includes(currentUser) ? currentUser : MEMBERS[0],
    studied: true,
    hours: '1',
    mood: 'Focused',
    topic: '',
  })
  const [error, setError] = useState('')
  const today = todayKey()

  const todayByMember = useMemo(() => {
    return MEMBERS.map((member) => {
      return checkins.find((checkin) => checkin.member === member && checkin.date === today)
    })
  }, [checkins, today])
  const checkedInCount = todayByMember.filter(Boolean).length

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const hours = Number(form.hours)

    if (!form.topic.trim()) {
      setError('Add a quick note about what happened today.')
      return
    }

    if (Number.isNaN(hours) || hours < 0) {
      setError('Study hours must be zero or more.')
      return
    }

    const entry = {
      id: createId('checkin'),
      member: form.member,
      date: today,
      studied: form.studied,
      hours,
      mood: form.mood,
      topic: form.topic.trim(),
      createdAt: new Date().toISOString(),
    }

    const next = [
      entry,
      ...checkins.filter((checkin) => !(checkin.member === form.member && checkin.date === today)),
    ]
    onSave(next, entry)
    setForm((current) => ({ ...current, topic: '', hours: current.studied ? '1' : '0' }))
  }

  return (
    <section className="glass-card room-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Daily check-in</span>
          <h2>Leave a tiny study trace</h2>
          <p className="section-support">
            A quick note helps your partner know how to support you tomorrow.
          </p>
        </div>
        <SmilePlus size={24} aria-hidden="true" />
      </div>

      <div className="room-status-strip">
        <span className="room-badge">
          <HeartPulse size={15} />
          {checkedInCount}/{MEMBERS.length} checked in today
        </span>
        <span className="room-badge warm">
          {checkedInCount === MEMBERS.length ? 'Room rhythm complete' : 'One honest note is enough'}
        </span>
      </div>

      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-sm-6 col-lg-3">
          <label className="form-label" htmlFor="checkin-member">
            Member
          </label>
          <select
            id="checkin-member"
            className="form-select"
            value={form.member}
            onChange={(event) => updateField('member', event.target.value)}
          >
            {MEMBERS.map((member) => (
              <option key={member}>{member}</option>
            ))}
          </select>
        </div>
        <div className="col-sm-6 col-lg-3">
          <label className="form-label" htmlFor="checkin-hours">
            Hours studied
          </label>
          <input
            id="checkin-hours"
            className="form-control"
            type="number"
            min="0"
            step="0.25"
            value={form.hours}
            onChange={(event) => updateField('hours', event.target.value)}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <label className="form-label" htmlFor="checkin-mood">
            Mood
          </label>
          <select
            id="checkin-mood"
            className="form-select"
            value={form.mood}
            onChange={(event) => updateField('mood', event.target.value)}
          >
            {moods.map((mood) => (
              <option key={mood}>{mood}</option>
            ))}
          </select>
        </div>
        <div className="col-sm-6 col-lg-3 d-flex align-items-end">
          <label className="check-pill">
            <input
              type="checkbox"
              checked={form.studied}
              onChange={(event) => updateField('studied', event.target.checked)}
            />
            Studied today
          </label>
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="checkin-topic">
            What happened at your desk?
          </label>
          <textarea
            id="checkin-topic"
            className="form-control"
            rows="3"
            value={form.topic}
            onChange={(event) => updateField('topic', event.target.value)}
            placeholder="Example: Solved two tricky questions, got stuck on one formula, still showed up."
          />
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="col-12">
          <button className="btn glow-btn" type="submit">
            <Save size={17} />
            Save Check-in
          </button>
        </div>
      </form>

      <div className="member-checkins">
        {MEMBERS.map((member, index) => {
          const checkin = todayByMember[index]

          return (
            <article className="member-checkin" key={member}>
              <div>
                <strong>{member}</strong>
                <span className={`mood-badge mood-${(checkin?.mood || 'none').toLowerCase()}`}>
                  {checkin?.mood || 'No check-in'}
                </span>
              </div>
              {checkin ? (
                <>
                  <p>
                    <CheckCircle2 size={16} />
                    {checkin.studied ? `${checkin.hours}h studied` : 'Rest day logged'}: {checkin.topic}
                  </p>
                  <small>{moodNotes[checkin.mood] || 'thanks for being honest'}</small>
                </>
              ) : (
                <p>No check-in yet. A short "I tried" still counts here.</p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default CheckInCard
