import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { ACCOUNT_TYPES, isPrivateAccountType } from '../data/studyUtils'

const accountTypeHelp = {
  Student: 'Public pages and dashboard',
  Couples: 'Couples private room access',
  VIP: 'VIP private room access',
}

function AccessPage() {
  const {
    accountType,
    activeRoom,
    authConfigured,
    error: authError,
    loading,
    roomLoading,
    signIn,
    signOut,
    signUp,
    updateAccountType,
    user,
  } = useAuth()
  const [mode, setMode] = useState('signin')
  const [draftAccountType, setDraftAccountType] = useState('Student')
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const selectedAccountType = user ? accountType : draftAccountType

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
    setMessage('')
  }

  const chooseAccountType = async (nextAccountType) => {
    setError('')
    setMessage('')

    if (!user) {
      setDraftAccountType(nextAccountType)
      setMessage(`${nextAccountType} selected for your account type.`)
      return
    }

    setSubmitting(true)
    try {
      await updateAccountType(nextAccountType)
      setMessage(`${nextAccountType} account type saved to your Supabase profile.`)
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
          setMessage('Account created and signed in. Your profile type is saved.')
          navigate(isPrivateAccountType(selectedAccountType) ? '/our-room' : '/dashboard')
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
      setMessage('Signed out. You can still browse the public study dashboard.')
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
            Class Room uses Supabase Auth, profile account types, and secure room membership
            policies. Student accounts can study publicly, while Couples and VIP accounts can create
            a private room.
          </p>
          <div className="prototype-note">
            <ShieldCheck size={20} />
            Private room data is only available to signed-in room members.
          </div>
        </div>

        <div className="glass-card access-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Account type</span>
              <h2>{user ? 'Your profile' : mode === 'signin' ? 'Log in' : 'Create account'}</h2>
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
                <span>{type}</span>
                <small>{accountTypeHelp[type]}</small>
              </button>
            ))}
          </div>

          {user ? (
            <div className="success-message">
              <strong>{accountType}</strong> account is signed in.
              {activeRoom ? (
                <span> Room ready: {activeRoom.name}</span>
              ) : privateType ? (
                <span> You can create a private room from Our Room.</span>
              ) : (
                <span> Private rooms are for Couples and VIP accounts.</span>
              )}
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
                    New accounts start as <strong>{selectedAccountType}</strong>. You can change
                    this profile type after logging in.
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
                <Link className="btn glow-btn" to="/our-room">
                  Open Private Room
                </Link>
                <button className="btn soft-btn" type="button" onClick={handleLogout} disabled={busy}>
                  <LogOut size={17} />
                  Log out
                </button>
              </>
            ) : (
              <Link className="btn soft-btn" to="/dashboard">
                Continue as Student
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
