import { useState } from 'react'
import { HeartHandshake, Send, Sparkles } from 'lucide-react'
import { createId, formatTime } from '../data/studyUtils'

const quotes = [
  'Consistency beats intensity when the goal is a life you can actually keep.',
  'One clear page today is better than ten rushed pages tomorrow.',
  'You do not need a perfect mood to make real progress.',
  'Start small, stay honest, and let the streak become proof.',
  'The next focused minute is enough to begin again.',
  'Two people showing up imperfectly can still build something steady.',
]
const encouragementPrompts = [
  'I saw your effort today.',
  'Take the smaller step. I am with you.',
  'Your hard chapter is allowed to take time.',
]

function MotivationBox({ encouragements, currentUser, onEncouragementsChange }) {
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [message, setMessage] = useState('')

  const nextQuote = () => {
    setQuoteIndex((current) => (current + 1) % quotes.length)
  }

  const sendEncouragement = () => {
    const text =
      message.trim() || `${currentUser} says: you are closer than you think. Keep going.`
    const encouragement = {
      id: createId('encouragement'),
      from: currentUser,
      message: text,
      createdAt: new Date().toISOString(),
    }

    onEncouragementsChange(
      [encouragement, ...encouragements],
      `${currentUser} sent encouragement: "${text}"`,
      'encouragement',
    )
    setMessage('')
  }

  return (
    <section className="glass-card room-card motivation-card">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Motivation box</span>
          <h2>Reset the room energy</h2>
          <p className="section-support">
            Send a small courage note when the room needs warmth more than pressure.
          </p>
        </div>
        <HeartHandshake size={24} aria-hidden="true" />
      </div>

      <blockquote>{quotes[quoteIndex]}</blockquote>

      <div className="motivation-actions">
        <button className="btn soft-btn" type="button" onClick={nextQuote}>
          <Sparkles size={17} />
          Give me motivation
        </button>
      </div>

      <div className="encouragement-form">
        <div className="prompt-chip-row" aria-label="Encouragement prompts">
          {encouragementPrompts.map((prompt) => (
            <button className="room-badge prompt-chip" type="button" key={prompt} onClick={() => setMessage(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
        <input
          className="form-control"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write a tiny courage note..."
          aria-label="Encouragement message"
        />
        <button className="btn glow-btn" type="button" onClick={sendEncouragement}>
          <Send size={17} />
          Send encouragement
        </button>
      </div>

      {encouragements.length ? (
        <div className="last-encouragement">
          <strong>Latest room note</strong>
          <p>{encouragements[0].message}</p>
          <small>
            {encouragements[0].from} - {formatTime(encouragements[0].createdAt)}
          </small>
        </div>
      ) : null}
    </section>
  )
}

export default MotivationBox
