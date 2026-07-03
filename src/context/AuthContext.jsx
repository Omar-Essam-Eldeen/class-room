import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSupabaseConfigError, isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import {
  createPrivateRoomForUser,
  fetchActiveRoomForUser,
  updateProfileAccountType,
  upsertProfile,
} from '../data/supabaseData'
import { getAccountType, getDisplayName } from '../data/studyUtils'
import { AuthContext } from './authContextValue'

function getAuthErrorMessage(error) {
  return error?.message || 'Something went wrong with authentication.'
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [activeRoom, setActiveRoom] = useState(null)
  const [membershipRole, setMembershipRole] = useState('')
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [roomLoading, setRoomLoading] = useState(false)
  const [error, setError] = useState(() => (isSupabaseConfigured ? '' : getSupabaseConfigError()))

  const loadUserWorkspace = useCallback(async (nextSession, preferredAccountType = '') => {
    if (!nextSession?.user) {
      setProfile(null)
      setActiveRoom(null)
      setMembershipRole('')
      return
    }

    setRoomLoading(true)
    setError('')

    try {
      const nextProfile = await upsertProfile(nextSession.user, preferredAccountType)
      const membership = await fetchActiveRoomForUser(nextSession.user.id)
      setProfile(nextProfile)
      setActiveRoom(membership?.room || null)
      setMembershipRole(membership?.role || '')
    } catch (nextError) {
      setError(nextError.message)
      setProfile(null)
      setActiveRoom(null)
      setMembershipRole('')
    } finally {
      setRoomLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined
    }

    let mounted = true

    supabase.auth.getSession().then(async ({ data, error: sessionError }) => {
      if (!mounted) return

      if (sessionError) {
        setError(getAuthErrorMessage(sessionError))
      }

      setSession(data.session)
      await loadUserWorkspace(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      loadUserWorkspace(nextSession)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadUserWorkspace])

  const signUp = useCallback(
    async ({ accountType, email, password }) => {
      if (!isSupabaseConfigured) throw new Error(getSupabaseConfigError())

      setError('')
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            account_type: accountType,
            display_name: accountType,
          },
        },
      })

      if (signUpError) {
        setError(getAuthErrorMessage(signUpError))
        throw signUpError
      }

      if (data.session) {
        setSession(data.session)
        await loadUserWorkspace(data.session, accountType)
      }

      return data
    },
    [loadUserWorkspace],
  )

  const signIn = useCallback(
    async ({ email, password }) => {
      if (!isSupabaseConfigured) throw new Error(getSupabaseConfigError())

      setError('')
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        setError(getAuthErrorMessage(signInError))
        throw signInError
      }

      setSession(data.session)
      await loadUserWorkspace(data.session)
      return data
    },
    [loadUserWorkspace],
  )

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return

    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setError(getAuthErrorMessage(signOutError))
      throw signOutError
    }

    setSession(null)
    setProfile(null)
    setActiveRoom(null)
    setMembershipRole('')
  }, [])

  const updateAccountType = useCallback(
    async (accountType) => {
      if (!session?.user) throw new Error('Sign in before changing account type.')
      if (!isSupabaseConfigured) throw new Error(getSupabaseConfigError())

      setError('')
      const nextProfile = await updateProfileAccountType(session.user.id, accountType)
      setProfile(nextProfile)
      return nextProfile
    },
    [session],
  )

  const createPrivateRoom = useCallback(async () => {
    if (!session?.user) throw new Error('Sign in before creating a private room.')
    if (!profile) throw new Error('Profile is still loading. Try again in a moment.')
    if (!isSupabaseConfigured) throw new Error(getSupabaseConfigError())

    setRoomLoading(true)
    setError('')

    try {
      const membership = await createPrivateRoomForUser(session.user, profile)
      setActiveRoom(membership.room)
      setMembershipRole(membership.role)
      return membership
    } catch (nextError) {
      setError(nextError.message)
      throw nextError
    } finally {
      setRoomLoading(false)
    }
  }, [profile, session])

  const refreshWorkspace = useCallback(async () => {
    await loadUserWorkspace(session)
  }, [loadUserWorkspace, session])

  const value = useMemo(
    () => ({
      activeRoom,
      accountType: getAccountType(profile, session?.user),
      authConfigured: isSupabaseConfigured,
      createPrivateRoom,
      displayName: getDisplayName(profile, session?.user),
      error,
      loading,
      membershipRole,
      profile,
      refreshWorkspace,
      roomLoading,
      session,
      signIn,
      signOut,
      signUp,
      updateAccountType,
      user: session?.user || null,
    }),
    [
      activeRoom,
      createPrivateRoom,
      error,
      loading,
      membershipRole,
      profile,
      refreshWorkspace,
      roomLoading,
      session,
      signIn,
      signOut,
      signUp,
      updateAccountType,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
