import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LockKeyhole, ShieldCheck, UserRoundCheck } from 'lucide-react'
import {
  MEMBERS,
  PRIVATE_PASSCODE,
  addActivity,
  ensureDemoData,
  getStoredUser,
  setPrivateAccess,
  setStoredUser,
} from '../data/storage'

const users = ['Magic', 'Partner', 'Guest']

function AccessPage() {
  ensureDemoData()

  const [selectedUser, setSelectedUser] = useState(getStoredUser)
  const [passcode, setPasscode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const chooseUser = (user) => {
    setSelectedUser(user)
    setStoredUser(user)
    setPasscode('')
    setMessage(`${user} selected for this demo session.`)
    setError('')
    window.dispatchEvent(new Event('classroom-user-change'))
  }

  const handlePasscodeSubmit = (event) => {
    event.preventDefault()
    setStoredUser(selectedUser)

    if (!MEMBERS.includes(selectedUser)) {
      setError('Guests can use the public dashboard, but cannot unlock the private room.')
      return
    }

    if (passcode.trim() !== PRIVATE_PASSCODE) {
      setError('That passcode does not match the prototype room code.')
      return
    }

    setPrivateAccess(true)
    addActivity(`${selectedUser} unlocked the private study room.`, 'system', selectedUser)
    window.dispatchEvent(new Event('classroom-user-change'))
    navigate('/our-room')
  }

  const goToDashboard = () => {
    setStoredUser(selectedUser)
    window.dispatchEvent(new Event('classroom-user-change'))
    navigate('/dashboard')
  }

  return (
    <main className="page-shell">
      <section className="access-layout container">
        <div className="access-copy">
          <span className="section-kicker">Prototype access</span>
          <h1>Choose who is entering Class Room</h1>
          <p>
            This screen simulates access for the prototype. Production should use Supabase Auth,
            row-level security, and proper server-side room permissions.
          </p>
          <div className="prototype-note">
            <ShieldCheck size={20} />
            Passcode for the private room: <strong>{PRIVATE_PASSCODE}</strong>
          </div>
        </div>

        <div className="glass-card access-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Demo login</span>
              <h2>Select a user</h2>
            </div>
            <UserRoundCheck size={24} aria-hidden="true" />
          </div>

          <div className="user-choice-grid" role="group" aria-label="Choose demo user">
            {users.map((user) => (
              <button
                type="button"
                className={`user-choice ${selectedUser === user ? 'active' : ''}`}
                key={user}
                onClick={() => chooseUser(user)}
              >
                <span>{user}</span>
                <small>
                  {user === 'Guest' ? 'Public demo only' : 'Can unlock private room'}
                </small>
              </button>
            ))}
          </div>

          <form onSubmit={handlePasscodeSubmit}>
            <label className="form-label" htmlFor="private-passcode">
              Private room passcode
            </label>
            <div className="passcode-row">
              <input
                id="private-passcode"
                className="form-control"
                type="password"
                value={passcode}
                onChange={(event) => {
                  setPasscode(event.target.value)
                  setError('')
                }}
                placeholder="Enter passcode"
              />
              <button className="btn glow-btn" type="submit">
                <LockKeyhole size={17} />
                Unlock
              </button>
            </div>
          </form>

          {message ? <p className="success-message">{message}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}

          <div className="access-actions">
            <button className="btn soft-btn" type="button" onClick={goToDashboard}>
              Go to Dashboard
            </button>
            <Link className="btn link-btn" to="/">
              Back Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AccessPage
