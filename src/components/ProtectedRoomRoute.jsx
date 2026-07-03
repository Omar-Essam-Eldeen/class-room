import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { LockKeyhole, Sparkles } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { isPrivateAccountType } from '../data/studyUtils'

function ProtectedRoomRoute({ children }) {
  const {
    accountType,
    activeRoom,
    authConfigured,
    createPrivateRoom,
    error,
    loading,
    roomLoading,
    user,
  } = useAuth()
  const [setupError, setSetupError] = useState('')
  const navigate = useNavigate()

  const handleCreateRoom = async () => {
    setSetupError('')

    try {
      await createPrivateRoom()
      navigate('/our-room', { replace: true })
    } catch (nextError) {
      setSetupError(nextError.message)
    }
  }

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
          <span className="section-kicker">Loading room</span>
          <h1>Checking your room access...</h1>
          <p>We are confirming your signed-in account and room membership.</p>
        </section>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/access" replace />
  }

  if (!isPrivateAccountType(accountType)) {
    return (
      <main className="page-shell locked-page">
        <section className="glass-card locked-card">
          <LockKeyhole size={34} aria-hidden="true" />
          <span className="section-kicker">Private room locked</span>
          <h1>Private rooms are for Couples and VIP accounts.</h1>
          <p>
            Your Student profile can use the public pages and dashboard. Switch to Couples or VIP
            from the Access page when you are ready to create a shared study room.
          </p>
          <div className="locked-actions">
            <Link className="btn glow-btn" to="/access">
              Change Account Type
            </Link>
            <Link className="btn soft-btn" to="/dashboard">
              Back to Dashboard
            </Link>
          </div>
        </section>
      </main>
    )
  }

  if (!activeRoom) {
    return (
      <main className="page-shell locked-page">
        <section className="glass-card locked-card">
          <Sparkles size={34} aria-hidden="true" />
          <span className="section-kicker">{accountType} room setup</span>
          <h1>You do not have a private room yet.</h1>
          <p>
            Create a cozy private study room, become the owner, and start saving tasks, check-ins,
            notes, focus sessions, encouragement, and activity to Supabase.
          </p>
          {setupError || error ? <p className="form-error">{setupError || error}</p> : null}
          <div className="locked-actions">
            <button className="btn glow-btn" type="button" onClick={handleCreateRoom}>
              Create My Private Room
            </button>
            <Link className="btn soft-btn" to="/dashboard">
              Back to Dashboard
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return children
}

export default ProtectedRoomRoute
