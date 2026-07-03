import { Link } from 'react-router-dom'
import { Home, LockKeyhole } from 'lucide-react'

function AccessDeniedPage() {
  return (
    <main className="page-shell">
      <section className="container locked-page">
        <div className="glass-card locked-card">
          <div className="locked-icon" aria-hidden="true">
            <LockKeyhole size={36} />
          </div>
          <span className="section-kicker">Private room</span>
          <h1>Room access needs a quick check.</h1>
          <p>
            Sign in, choose a Couples or VIP profile, and open Our Room. If you do not have a room
            yet, Class Room will guide you through creating one.
          </p>
          <div className="locked-actions">
            <Link className="btn glow-btn" to="/access">
              <LockKeyhole size={17} />
              Go to access page
            </Link>
            <Link className="btn soft-btn" to="/">
              <Home size={17} />
              Go home
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AccessDeniedPage
