import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoorOpen, Filter, ListFilter, Plus, Search, Sparkles, UsersRound, X } from 'lucide-react'
import RoomMembershipPanel from '../components/RoomMembershipPanel'
import { useAuth } from '../context/useAuth'
import { createRoomForUser, fetchRoomsDirectory, joinRoomForUser } from '../data/supabaseData'
import {
  ACCOUNT_TYPES,
  ROOM_DESIGN_STYLES,
  ROOM_TYPE_PRIORITY,
  canCreateRoomType,
  canJoinRoomType,
  getAccountRoomLimit,
  getAccountTypeLabel,
  getDefaultDesignStyle,
  getDefaultRoomName,
  getRoomOccupancy,
  getRoomStatus,
  getRoomTools,
  isPrivateAccountType,
  normalizeAccountType,
} from '../data/studyUtils'

const fallbackRooms = [
  {
    id: 'sample-vip',
    name: 'VIP Glass Suite',
    roomType: 'vip',
    room_type: 'vip',
    designStyle: 'VIP Glass Suite',
    maxMembers: 5,
    currentMembers: 0,
    memberSummaries: [{ display_name: 'Nova', account_type: 'vip', room_count: 2, activity_score: 180, public_badge_count: 4 }],
  },
  {
    id: 'sample-couples',
    name: 'Soft Couple Room',
    roomType: 'couples',
    room_type: 'couples',
    designStyle: 'Soft Couple Room',
    maxMembers: 2,
    currentMembers: 1,
    memberSummaries: [{ display_name: 'Mina', account_type: 'couples', room_count: 1, activity_score: 95, public_badge_count: 3 }],
  },
  {
    id: 'sample-student',
    name: 'Cozy Library Study Hall',
    roomType: 'student',
    room_type: 'student',
    designStyle: 'Cozy Library',
    maxMembers: 15,
    currentMembers: 3,
    memberSummaries: [{ display_name: 'Omar', account_type: 'student', room_count: 1, activity_score: 35, public_badge_count: 1 }],
  },
]

const initialFilters = {
  crowdedness: 'none',
  query: '',
  status: 'all',
  type: 'all',
  typePriority: 'vip-first',
}

function sortRooms(rooms, filters) {
  const direction = filters.typePriority === 'student-first' ? 1 : -1
  const sorted = [...rooms].sort((first, second) => {
    const firstPriority = ROOM_TYPE_PRIORITY[first.roomType] || 0
    const secondPriority = ROOM_TYPE_PRIORITY[second.roomType] || 0
    return (firstPriority - secondPriority) * direction
  })

  if (filters.crowdedness === 'most') {
    sorted.sort((first, second) => getRoomOccupancy(second) - getRoomOccupancy(first))
  }

  if (filters.crowdedness === 'least') {
    sorted.sort((first, second) => getRoomOccupancy(first) - getRoomOccupancy(second))
  }

  return sorted
}

function RoomsDirectoryPage() {
  const { accountType, authConfigured, profile, refreshWorkspace, roomLoading, user, userRooms } = useAuth()
  const [rooms, setRooms] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [createOpen, setCreateOpen] = useState(false)
  const [previewRoom, setPreviewRoom] = useState(null)
  const [form, setForm] = useState({
    designStyle: 'Cozy Library',
    name: '',
    roomType: 'student',
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const userRoomIds = useMemo(() => new Set(userRooms.map((membership) => membership.room?.id)), [userRooms])
  const createOptions = ACCOUNT_TYPES.filter((type) => canCreateRoomType(accountType, type))
  const roomLimit = getAccountRoomLimit(accountType)
  const roomLimitReached = user && userRooms.length >= roomLimit

  const loadRooms = useCallback(async () => {
    if (!authConfigured) {
      setRooms(fallbackRooms)
      return
    }

    setLoading(true)
    setError('')

    try {
      setRooms(await fetchRoomsDirectory())
    } catch (nextError) {
      setError(nextError.message)
      setRooms(fallbackRooms)
    } finally {
      setLoading(false)
    }
  }, [authConfigured])

  useEffect(() => {
    Promise.resolve().then(loadRooms)
  }, [loadRooms])

  const visibleRooms = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    const filtered = rooms.filter((room) => {
      const status = getRoomStatus(room)
      const matchesQuery = !query || room.name.toLowerCase().includes(query)
      const matchesType = filters.type === 'all' || room.roomType === filters.type
      const matchesStatus = filters.status === 'all' || status === filters.status
      return matchesQuery && matchesType && matchesStatus
    })

    return sortRooms(filtered, filters)
  }, [filters, rooms])

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
    setMessage('')
  }

  const openCreate = () => {
    if (!user) {
      navigate('/access')
      return
    }

    if (roomLimitReached) {
      setError(`${getAccountTypeLabel(accountType)} accounts can join or create up to ${roomLimit} room${roomLimit === 1 ? '' : 's'}.`)
      return
    }

    const initialRoomType = createOptions[0] || accountType
    setForm({
      designStyle: getDefaultDesignStyle(initialRoomType),
      name: '',
      roomType: initialRoomType,
    })
    setCreateOpen(true)
    setError('')
    setMessage('')
  }

  const handleCreateRoom = async (event) => {
    event.preventDefault()
    if (!user || !profile) {
      navigate('/access')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const roomType = normalizeAccountType(form.roomType)
      const designStyle = ROOM_DESIGN_STYLES.includes(form.designStyle)
        ? form.designStyle
        : getDefaultDesignStyle(roomType)
      await createRoomForUser({
        designStyle,
        name: form.name || getDefaultRoomName(roomType),
        profile,
        roomType,
        user,
      })
      await refreshWorkspace()
      await loadRooms()
      setCreateOpen(false)
      setMessage(`${getAccountTypeLabel(roomType)} room created.`)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleJoinRoom = async (room) => {
    if (!user || !profile) {
      navigate('/access')
      return
    }

    if (userRoomIds.has(room.id)) {
      navigate(isPrivateAccountType(room.roomType) && room.roomType === accountType ? '/our-room' : '/dashboard')
      return
    }

    if (room.roomType === 'couples' && accountType === 'vip' && !userRoomIds.has(room.id)) {
      navigate('/couples-preview')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      await joinRoomForUser({ profile, room, user })
      await refreshWorkspace()
      await loadRooms()
      setMessage(`Joined ${room.name}.`)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="page-shell">
      <section className="page-hero rooms-hero">
        <div className="container">
          <span className="section-kicker">Rooms directory</span>
          <h1>Find the right room for the kind of studying you need.</h1>
          <p>
            Browse public room metadata without exposing private tasks, notes, check-ins, sessions,
            or member details. Creating and joining rooms depends on your signed-in account type.
          </p>
          <div className="welcome-actions">
            <button className="btn glow-btn" type="button" onClick={openCreate}>
              <Plus size={17} />
              Create Room
            </button>
            <button className="btn soft-btn" type="button" onClick={loadRooms} disabled={loading}>
              <ListFilter size={17} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="section-pad rooms-directory-section">
        <div className="container">
          {!authConfigured ? (
            <p className="inline-alert">Supabase is not configured, so sample room metadata is shown.</p>
          ) : null}
          {message ? <p className="success-message">{message}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
          {loading || roomLoading ? <p className="inline-alert">Loading room directory...</p> : null}
          {user ? (
            <p className="inline-alert">
              Your active plan allows {roomLimit} room{roomLimit === 1 ? '' : 's'}. You are currently in {userRooms.length}.
            </p>
          ) : null}
          <RoomMembershipPanel compact onChanged={loadRooms} />

          <div className="rooms-toolbar glass-card">
            <label className="search-control" htmlFor="room-search">
              <Search size={18} aria-hidden="true" />
              <input
                id="room-search"
                type="search"
                value={filters.query}
                onChange={(event) => updateFilter('query', event.target.value)}
                placeholder="Search rooms by name"
              />
            </label>
            <select value={filters.type} onChange={(event) => updateFilter('type', event.target.value)}>
              <option value="all">All room types</option>
              <option value="vip">VIP</option>
              <option value="couples">Couples</option>
              <option value="student">Student</option>
            </select>
            <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
              <option value="all">All statuses</option>
              <option>Available</option>
              <option>Busy</option>
              <option>Full</option>
            </select>
            <select value={filters.typePriority} onChange={(event) => updateFilter('typePriority', event.target.value)}>
              <option value="vip-first">VIP to Student</option>
              <option value="student-first">Student to VIP</option>
            </select>
            <select value={filters.crowdedness} onChange={(event) => updateFilter('crowdedness', event.target.value)}>
              <option value="none">Default crowdedness</option>
              <option value="most">Most crowded</option>
              <option value="least">Least crowded</option>
            </select>
          </div>

          {visibleRooms.length ? (
            <div className="rooms-grid">
              {visibleRooms.map((room) => {
                const status = getRoomStatus(room)
                const occupancy = Math.round(getRoomOccupancy(room) * 100)
                const isMember = userRoomIds.has(room.id)
                const full = status === 'Full'
                const allowedToJoin = user && canJoinRoomType(accountType, room, isMember)
                const previewOnly = user && accountType === 'vip' && room.roomType === 'couples' && !isMember
                const locked = user && (!allowedToJoin || roomLimitReached) && !previewOnly && !isMember

                return (
                  <article className="glass-card room-directory-card" key={room.id}>
                    <div className="room-directory-top">
                      <span className={`room-type-badge room-type-${room.roomType}`}>
                        {getAccountTypeLabel(room.roomType)}
                      </span>
                      <span className={`room-status-badge status-${status.toLowerCase()}`}>{status}</span>
                    </div>
                    <h2>{room.name}</h2>
                    <p>{room.designStyle}</p>
                    <div className="occupancy-line">
                      <span>
                        <UsersRound size={16} />
                        {room.currentMembers}/{room.maxMembers} members
                      </span>
                      <strong>{occupancy}%</strong>
                    </div>
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${occupancy}%` }} />
                    </div>
                    <div className="room-tools-list">
                      {getRoomTools(room.roomType).map((tool) => (
                        <span key={tool}>{tool}</span>
                      ))}
                    </div>
                    <div className="public-member-strip">
                      {(room.memberSummaries?.length ? room.memberSummaries : []).slice(0, 2).map((member) => (
                        <span key={`${room.id}-${member.display_name}`}>
                          {member.display_name} - {getAccountTypeLabel(member.account_type)} - {member.public_badge_count || 0} stars
                        </span>
                      ))}
                      {!room.memberSummaries?.length ? <span>Public member summary appears after someone joins.</span> : null}
                    </div>
                    <div className="room-card-actions">
                      <button className="btn soft-btn" type="button" onClick={() => setPreviewRoom(room)}>
                        Preview
                      </button>
                      <button
                        className={`btn ${isMember ? 'soft-btn' : 'glow-btn'}`}
                        type="button"
                        onClick={() => handleJoinRoom(room)}
                        disabled={saving || full || locked || previewOnly}
                      >
                        <DoorOpen size={17} />
                        {full
                          ? 'Full'
                          : isMember
                            ? 'View'
                            : previewOnly || locked
                              ? 'Locked'
                              : user
                                ? 'Join'
                                : 'Sign in to Join'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="glass-card empty-directory-state">
              <Filter size={28} aria-hidden="true" />
              <h2>{rooms.length ? 'No rooms match this filter' : 'No rooms found'}</h2>
              <p>Try clearing the search, changing filters, or creating the first room.</p>
            </div>
          )}
        </div>
      </section>

      {createOpen ? (
        <div className="modal-backdrop-soft" role="presentation">
          <section className="glass-card room-create-modal" role="dialog" aria-modal="true" aria-labelledby="create-room-title">
            <button className="icon-btn modal-close" type="button" aria-label="Close create room" onClick={() => setCreateOpen(false)}>
              <X size={18} />
            </button>
            <span className="section-kicker">Create room</span>
            <h2 id="create-room-title">Set up a study space</h2>
            <form onSubmit={handleCreateRoom}>
              <label className="form-label" htmlFor="room-type">
                Room type
              </label>
              <select
                id="room-type"
                className="form-select"
                value={form.roomType}
                onChange={(event) => {
                  const nextType = normalizeAccountType(event.target.value)
                  setForm((current) => ({
                    ...current,
                    designStyle: getDefaultDesignStyle(nextType),
                    roomType: nextType,
                  }))
                }}
              >
                {createOptions.map((type) => (
                  <option key={type} value={type}>
                    {getAccountTypeLabel(type)}
                  </option>
                ))}
              </select>

              <label className="form-label mt-3" htmlFor="room-name">
                Room name
              </label>
              <input
                id="room-name"
                className="form-control"
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
                placeholder={getDefaultRoomName(form.roomType)}
              />

              <label className="form-label mt-3" htmlFor="room-style">
                Design style
              </label>
              <select
                id="room-style"
                className="form-select"
                value={form.designStyle}
                onChange={(event) => updateForm('designStyle', event.target.value)}
              >
                {ROOM_DESIGN_STYLES.map((style) => (
                  <option key={style}>{style}</option>
                ))}
              </select>

              <div className="room-create-summary">
                <Sparkles size={17} aria-hidden="true" />
                <span>
                  {getAccountTypeLabel(form.roomType)} rooms include {getRoomTools(form.roomType).join(', ')}.
                </span>
              </div>

              <button className="btn glow-btn w-100 mt-3" type="submit" disabled={saving}>
                {saving ? 'Creating...' : 'Create Room'}
              </button>
            </form>
          </section>
        </div>
      ) : null}

      {previewRoom ? (
        <div className="modal-backdrop-soft" role="presentation">
          <section className="glass-card room-create-modal room-preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-room-title">
            <button className="icon-btn modal-close" type="button" aria-label="Close room preview" onClick={() => setPreviewRoom(null)}>
              <X size={18} />
            </button>
            <span className="section-kicker">{getAccountTypeLabel(previewRoom.roomType)} preview</span>
            <h2 id="preview-room-title">{previewRoom.name}</h2>
            <p className="section-support">
              {previewRoom.designStyle} - {previewRoom.currentMembers}/{previewRoom.maxMembers} members - {getRoomStatus(previewRoom)}
            </p>
            <div className="room-tools-list">
              {getRoomTools(previewRoom.roomType).map((tool) => (
                <span key={tool}>{tool}</span>
              ))}
            </div>
            <div className="public-member-list">
              {(previewRoom.memberSummaries?.length ? previewRoom.memberSummaries : [
                {
                  account_type: previewRoom.roomType,
                  activity_score: 0,
                  display_name: 'Future member',
                  public_badge_count: 0,
                  room_count: 0,
                },
              ]).map((member) => (
                <article key={`${previewRoom.id}-${member.display_name}`}>
                  <strong>{member.display_name}</strong>
                  <span>{getAccountTypeLabel(member.account_type)} account</span>
                  <small>
                    {member.room_count || 0} rooms - activity {member.activity_score || 0} - {member.public_badge_count || 0} stars
                  </small>
                </article>
              ))}
            </div>
            <p className="inline-alert">Preview shows public metadata only. Private tasks, notes, check-ins, sessions, and messages stay hidden.</p>
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default RoomsDirectoryPage
