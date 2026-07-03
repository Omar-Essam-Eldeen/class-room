import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { LockKeyhole, Sparkles } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { getAccountTypeLabel, isPrivateAccountType } from '../data/studyUtils'

function ProtectedRoomRoute({ children }) {
  const {
    accountType,
    activeRoom,
    authConfigured,
    createPrivateRoom,
    error,
    loading,
    roomLoading,
    setActiveRoomById,
    user,
    userRooms,
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
          <span className="section-kicker">Student account</span>
          <h1>Private couples rooms are available for Couples and VIP accounts.</h1>
          <p>
            Your Student dashboard still has public rooms, a focus timer, limited notes, and basic
            progress tools. Private shared rituals stay reserved for upgraded accounts.
          </p>
          <div className="locked-actions">
            <Link className="btn glow-btn" to="/student">
              Student Dashboard
            </Link>
            <Link className="btn soft-btn" to="/rooms">
              Browse Public Rooms
            </Link>
          </div>
        </section>
      </main>
    )
  }

  if (!activeRoom || activeRoom.roomType !== accountType) {
    const roomLabel = getAccountTypeLabel(accountType)
    const actionLabel = 'Create My Private Room'
    const matchingRooms = userRooms.filter((membership) => membership.room?.roomType === accountType)

    if (matchingRooms.length) {
      return (
        <main className="page-shell locked-page">
          <section className="glass-card locked-card">
            <Sparkles size={34} aria-hidden="true" />
            <span className="section-kicker">{roomLabel} room selector</span>
            <h1>Choose your active room.</h1>
            <p>You belong to more than one room. Pick the one you want `/our-room` to open.</p>
            <div className="membership-room-list">
              {matchingRooms.map((membership) => (
                <article className="membership-room" key={membership.room.id}>
                  <div>
                    <strong>{membership.room.name}</strong>
                    <span>{membership.role}</span>
                  </div>
                  <button className="btn glow-btn" type="button" onClick={() => setActiveRoomById(membership.room.id)}>
                    Set Active Room
                  </button>
                </article>
              ))}
            </div>
          </section>
        </main>
      )
    }

    return (
      <main className="page-shell locked-page">
        <section className="glass-card locked-card">
          <Sparkles size={34} aria-hidden="true" />
          <span className="section-kicker">{roomLabel} setup</span>
          <h1>You do not have a private room yet.</h1>
          <p>
            Create your own secure study room, become the owner, and start saving tasks, check-ins,
            notes, focus sessions, encouragement, and activity to Supabase.
          </p>
          {setupError || error ? <p className="form-error">{setupError || error}</p> : null}
          <div className="locked-actions">
            <button className="btn glow-btn" type="button" onClick={handleCreateRoom}>
              {actionLabel}
            </button>
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

export default ProtectedRoomRoute
