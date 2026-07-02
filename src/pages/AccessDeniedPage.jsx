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
          <span className="section-kicker">Access denied</span>
          <h1>This room is private.</h1>
          <p>
            Magic and Partner can enter after choosing their demo identity and submitting the
            prototype passcode.
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
