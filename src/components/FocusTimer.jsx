import { useEffect, useState } from 'react'
import { Coffee, Pause, Play, RotateCcw, TimerReset } from 'lucide-react'

const presets = [
  { minutes: 25, label: 'Warm start' },
  { minutes: 45, label: 'Deep desk' },
  { minutes: 60, label: 'Big chapter' },
]
const noop = () => {}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function FocusTimer({ onComplete = noop }) {
  const [durationMinutes, setDurationMinutes] = useState(25)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!isRunning) return undefined

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          setIsRunning(false)
          setCompleted(true)
          onComplete(durationMinutes)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [durationMinutes, isRunning, onComplete])

  const choosePreset = (minutes) => {
    setDurationMinutes(minutes)
    setSecondsLeft(minutes * 60)
    setIsRunning(false)
    setCompleted(false)
  }

  const resetTimer = () => {
    setSecondsLeft(durationMinutes * 60)
    setIsRunning(false)
    setCompleted(false)
  }

  return (
    <section className="glass-card room-card timer-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Focus timer</span>
          <h2>Start a calm sprint</h2>
          <p className="section-support">
            Set a shared intention, then let the timer protect the room from distractions.
          </p>
        </div>
        <TimerReset size={24} aria-hidden="true" />
      </div>

      <div className="preset-row" aria-label="Timer presets">
        {presets.map(({ label, minutes }) => (
          <button
            className={`preset-btn ${durationMinutes === minutes ? 'active' : ''}`}
            type="button"
            key={minutes}
            onClick={() => choosePreset(minutes)}
          >
            <span>{minutes} min</span>
            <small>{label}</small>
          </button>
        ))}
      </div>

      <div className="timer-display" aria-live="polite">
        {formatTimer(secondsLeft)}
      </div>
      <p className="timer-companion-copy">
        {isRunning
          ? 'Room is holding this focus with you. One quiet minute after another.'
          : 'Pick the smallest sprint you can honestly finish, then make the room proud.'}
      </p>

      <div className="timer-actions">
        <button
          className="btn glow-btn"
          type="button"
          onClick={() => setIsRunning((current) => !current)}
          disabled={secondsLeft === 0}
        >
          {isRunning ? <Pause size={17} /> : <Play size={17} />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button className="btn soft-btn" type="button" onClick={resetTimer}>
          <RotateCcw size={17} />
          Reset
        </button>
      </div>

      {completed ? (
        <div className="break-card" role="status">
          <strong>
            <Coffee size={16} />
            Break reminder
          </strong>
          <p>Stretch, drink water, rest your eyes, then log a report so your partner can see the effort.</p>
        </div>
      ) : null}
    </section>
  )
}

export default FocusTimer
