import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoorOpen, Star, Trash2, UsersRound, X } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { getAccountTypeLabel, getRoomStatus, isPrivateAccountType } from '../data/studyUtils'

function RoomMembershipPanel({ compact = false, onChanged }) {
  const {
    activeRoom,
    deleteRoom,
    leaveRoom,
    membershipRole,
    roomLoading,
    setActiveRoomById,
    userRooms,
  } = useAuth()
  const [error, setError] = useState('')
  const navigate = useNavigate()

  if (!userRooms.length) {
    return null
  }

  const viewRoom = (membership) => {
    setActiveRoomById(membership.room.id)
    navigate(isPrivateAccountType(membership.room.roomType) ? '/our-room' : '/rooms')
  }

  const leave = async (membership) => {
    setError('')
    try {
      await leaveRoom(membership.room.id)
      await onChanged?.()
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  const remove = async (membership) => {
    setError('')
    const confirmed = window.confirm(`Delete ${membership.room.name}? This archives the room and hides it from the directory.`)
    if (!confirmed) return

    try {
      await deleteRoom(membership.room.id)
      await onChanged?.()
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  return (
    <section className={`glass-card membership-panel ${compact ? 'compact' : ''}`}>
      <div className="section-heading">
        <div>
          <span className="section-kicker">Active Room</span>
          <h2>{activeRoom?.name || 'Choose a room'}</h2>
        </div>
        <UsersRound size={22} aria-hidden="true" />
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="membership-room-list">
        {userRooms.map((membership) => {
          const isActive = activeRoom?.id === membership.room.id
          const isOwner = membership.role === 'owner' || (isActive && membershipRole === 'owner')
          const status = getRoomStatus(membership.room)

          return (
            <article className={`membership-room ${isActive ? 'active' : ''}`} key={membership.room.id}>
              <div>
                <strong>{membership.room.name}</strong>
                <span>
                  {getAccountTypeLabel(membership.room.roomType)} - {membership.role} - {status}
                </span>
              </div>
              <div className="membership-actions">
                {!isActive ? (
                  <button className="btn soft-btn" type="button" onClick={() => setActiveRoomById(membership.room.id)}>
                    <Star size={15} />
                    Set Active
                  </button>
                ) : null}
                <button className="btn soft-btn" type="button" onClick={() => viewRoom(membership)} disabled={roomLoading}>
                  <DoorOpen size={15} />
                  View Room
                </button>
                <button className="btn soft-btn danger-soft" type="button" onClick={() => leave(membership)} disabled={roomLoading}>
                  <X size={15} />
                  Leave
                </button>
                {isOwner ? (
                  <button className="btn soft-btn danger-soft" type="button" onClick={() => remove(membership)} disabled={roomLoading}>
                    <Trash2 size={15} />
                    Delete
                  </button>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default RoomMembershipPanel
