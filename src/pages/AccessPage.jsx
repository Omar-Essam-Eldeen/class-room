import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { ACCOUNT_TYPES, getAccountTypeLabel, isPrivateAccountType } from '../data/studyUtils'

const accountTypeHelp = {
  student: 'Basic study dashboard and public rooms',
  couples: 'Private couples room and shared rituals',
  vip: 'Premium tools, previews, and VIP rooms',
}

function getHomeRoute(accountType) {
  if (accountType === 'vip') return '/vip'
  if (accountType === 'couples') return '/couples'
  return '/student'
}

function AccessPage() {
  const {
    accountType,
    accountTypeLabel,
    activeRoom,
    authConfigured,
    error: authError,
    loading,
    profile,
    realAccountType,
    roomLoading,
    signIn,
    signOut,
    signUp,
    updateAccountType,
    user,
  } = useAuth()
  const [mode, setMode] = useState('signin')
  const [draftAccountType, setDraftAccountType] = useState('student')
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const selectedAccountType = user ? realAccountType : draftAccountType

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
    setMessage('')
  }

  const chooseAccountType = async (nextAccountType) => {
    setError('')

    if (!user) {
      setDraftAccountType(nextAccountType)
      setMessage(`${getAccountTypeLabel(nextAccountType)} selected for signup.`)
      return
    }

    if (nextAccountType === realAccountType) {
      setMessage(`${getAccountTypeLabel(nextAccountType)} is already saved on your profile.`)
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      await updateAccountType(nextAccountType)
      setMessage(`${getAccountTypeLabel(nextAccountType)} is now saved on your Supabase profile.`)
      navigate(getHomeRoute(nextAccountType))
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'signup') {
        const result = await signUp({
          accountType: selectedAccountType,
          email: form.email.trim(),
          password: form.password,
        })

        if (result.session) {
          setMessage('Account created and signed in. Your account type is locked to this profile.')
          navigate(getHomeRoute(selectedAccountType))
        } else {
          setMessage('Account created. Check your email if confirmation is enabled in Supabase.')
        }
      } else {
        await signIn({
          email: form.email.trim(),
          password: form.password,
        })
        setMessage('Signed in. Your Supabase profile is loaded.')
        navigate('/dashboard')
      }
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      await signOut()
      setMessage('Signed out. You are browsing as a visitor.')
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const busy = loading || roomLoading || submitting
  const privateType = isPrivateAccountType(accountType)

  return (
    <main className="page-shell">
      <section className="access-layout container">
        <div className="access-copy">
          <span className="section-kicker">Supabase access</span>
          <h1>Sign in to Class Room</h1>
          <p>
            Choose Student, Couples, or VIP during signup, then adjust the saved profile type here
            whenever you want to test a different access level.
          </p>
          <div className="prototype-note">
            <ShieldCheck size={20} />
            Signed-out visitors can browse public pages and room metadata, but only real accounts
            can join, create, or open rooms.
          </div>
        </div>

        <div className="glass-card access-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Account type</span>
              <h2>{user ? `${accountTypeLabel} profile` : mode === 'signin' ? 'Log in' : 'Create account'}</h2>
            </div>
            <UserRoundCheck size={24} aria-hidden="true" />
          </div>

          {!authConfigured ? <p className="form-error">{authError}</p> : null}

          <div className="user-choice-grid" role="group" aria-label="Choose account type">
            {ACCOUNT_TYPES.map((type) => (
              <button
                type="button"
                className={`user-choice ${selectedAccountType === type ? 'active' : ''}`}
                key={type}
                onClick={() => chooseAccountType(type)}
                disabled={busy}
              >
                <span>{getAccountTypeLabel(type)}</span>
                <small>{accountTypeHelp[type]}</small>
              </button>
            ))}
          </div>

          {user ? (
            <div className="success-message">
              <strong>{accountTypeLabel}</strong> account is signed in.
              {activeRoom && privateType ? (
                <span> Room ready: {activeRoom.name}</span>
              ) : privateType ? (
                <span> Open Our Room to create your private room.</span>
              ) : (
                <span> Use Student tools and public rooms from your dashboard.</span>
              )}
              <span> Stars: {profile?.stars || 0}. Badges: {profile?.public_badge_count || 0}.</span>
            </div>
          ) : (
            <>
              <div className="tool-tabs auth-tabs" role="tablist" aria-label="Authentication mode">
                <button
                  className={`tool-tab ${mode === 'signin' ? 'active' : ''}`}
                  type="button"
                  aria-selected={mode === 'signin'}
                  onClick={() => setMode('signin')}
                >
                  Log in
                </button>
                <button
                  className={`tool-tab ${mode === 'signup' ? 'active' : ''}`}
                  type="button"
                  aria-selected={mode === 'signup'}
                  onClick={() => setMode('signup')}
                >
                  Sign up
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {mode === 'signup' ? (
                  <p className="inline-alert">
                    New accounts start as <strong>{getAccountTypeLabel(selectedAccountType)}</strong>. This
                    profile type is stored in Supabase.
                  </p>
                ) : null}
                <label className="form-label" htmlFor="auth-email">
                  Email
                </label>
                <input
                  id="auth-email"
                  className="form-control"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="you@example.com"
                  required
                />

                <label className="form-label mt-3" htmlFor="auth-password">
                  Password
                </label>
                <input
                  id="auth-password"
                  className="form-control"
                  type="password"
                  minLength="6"
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  placeholder="At least 6 characters"
                  required
                />

                <button className="btn glow-btn mt-3 w-100" type="submit" disabled={!authConfigured || busy}>
                  {busy ? 'Please wait...' : mode === 'signin' ? 'Log in' : 'Create account'}
                </button>
              </form>
            </>
          )}

          {message ? <p className="success-message">{message}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}

          <div className="access-actions">
            {user ? (
              <>
                <Link className="btn glow-btn" to="/dashboard">
                  Open Dashboard
                </Link>
                <Link className="btn soft-btn" to="/rooms">
                  Rooms Directory
                </Link>
                <button className="btn soft-btn" type="button" onClick={handleLogout} disabled={busy}>
                  <LogOut size={17} />
                  Log out
                </button>
              </>
            ) : (
              <Link className="btn soft-btn" to="/rooms">
                Browse Rooms
              </Link>
            )}
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
