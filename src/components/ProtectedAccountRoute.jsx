import { Link, Navigate } from 'react-router-dom'
import { LockKeyhole } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { getAccountTypeLabel } from '../data/studyUtils'

function ProtectedAccountRoute({ allowedTypes = [], children, title = 'This page needs a different account type.' }) {
  const { accountType, accountTypeLabel, authConfigured, error, loading, roomLoading, user } = useAuth()
  const allowed = allowedTypes.length === 0 || allowedTypes.includes(accountType)

  if (!authConfigured) {
    return (
      <main className="page-shell locked-page">
        <section className="glass-card locked-card">
          <h1>Supabase setup needed.</h1>
          <p>{error}</p>
        </section>
      </main>
    )
  }

  if (loading || roomLoading) {
    return (
      <main className="page-shell locked-page">
        <section className="glass-card locked-card">
          <span className="section-kicker">Loading account</span>
          <h1>Checking your profile...</h1>
          <p>We are confirming your signed-in account and profile type.</p>
        </section>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/access" replace />
  }

  if (!allowed) {
    return (
      <main className="page-shell locked-page">
        <section className="glass-card locked-card">
          <LockKeyhole size={34} aria-hidden="true" />
          <span className="section-kicker">{accountTypeLabel} profile</span>
          <h1>{title}</h1>
          <p>
            This route is available for {allowedTypes.map(getAccountTypeLabel).join(' or ')} accounts.
            Your access will not change unless you go through a real plan-change flow.
          </p>
          <div className="locked-actions">
            <Link className="btn glow-btn" to="/dashboard">
              Back to Dashboard
            </Link>
            <Link className="btn soft-btn" to="/rooms">
              Browse Rooms
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return children
}

export default ProtectedAccountRoute
