import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSupabaseConfigError, isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import {
  createPrivateRoomForUser,
  deleteRoomForUser,
  fetchUserRooms,
  leaveRoomForUser,
  updateProfileAccountType,
  upsertProfile,
} from '../data/supabaseData'
import { getAccountType, getAccountTypeLabel, getDisplayName, getEffectiveAccountType } from '../data/studyUtils'
import { AuthContext } from './authContextValue'

const ACTIVE_ROOM_KEY = 'classroom-active-room-id'
const AUTH_REQUEST_TIMEOUT_MS = 20000
const WORKSPACE_REQUEST_TIMEOUT_MS = 12000

function getAuthErrorMessage(error) {
  return error?.message || 'Something went wrong with authentication.'
}

function withTimeout(promise, timeoutMs, message) {
  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = globalThis.setTimeout(() => reject(new Error(message)), timeoutMs)
  })

  return Promise.race([promise, timeout]).finally(() => {
    globalThis.clearTimeout(timeoutId)
  })
}

function createFallbackProfile(user, accountType = '') {
  const fallbackAccountType = getAccountType({ account_type: accountType }, user)

  return {
    account_type: fallbackAccountType,
    display_name: user?.user_metadata?.display_name || getAccountTypeLabel(fallbackAccountType),
    email: user?.email || '',
    id: user?.id || '',
    public_badge_count: 0,
    stars: 0,
  }
}

function readActiveRoomPreference() {
  return globalThis.localStorage?.getItem(ACTIVE_ROOM_KEY) || ''
}

function writeActiveRoomPreference(roomId) {
  if (roomId) {
    globalThis.localStorage?.setItem(ACTIVE_ROOM_KEY, roomId)
  } else {
    globalThis.localStorage?.removeItem(ACTIVE_ROOM_KEY)
  }
}

function chooseActiveMembership(memberships, accountType) {
  const preferredRoomId = readActiveRoomPreference()
  const preferred = memberships.find((membership) => membership.room?.id === preferredRoomId)
  if (preferred) return preferred

  const matchingType = memberships.find((membership) => membership.room?.roomType === accountType)
  return matchingType || memberships[0] || null
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [activeRoom, setActiveRoom] = useState(null)
  const [membershipRole, setMembershipRole] = useState('')
  const [userRooms, setUserRooms] = useState([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [roomLoading, setRoomLoading] = useState(false)
  const [error, setError] = useState(() => (isSupabaseConfigured ? '' : getSupabaseConfigError()))

  const loadUserWorkspace = useCallback(async (nextSession, preferredAccountType = '') => {
    if (!nextSession?.user) {
      setProfile(null)
      setActiveRoom(null)
      setMembershipRole('')
      setUserRooms([])
      return
    }

    setRoomLoading(true)
    setError('')

    try {
      const nextProfile = await withTimeout(
        upsertProfile(nextSession.user, preferredAccountType),
        WORKSPACE_REQUEST_TIMEOUT_MS,
        'Profile loading timed out. Your account exists, but the profile request did not finish.',
      )
      const nextAccountType = getEffectiveAccountType(nextProfile, nextSession.user)
      let memberships = []

      try {
        memberships = await withTimeout(
          fetchUserRooms(nextSession.user.id),
          WORKSPACE_REQUEST_TIMEOUT_MS,
          'Room loading timed out. Your account is signed in, but rooms could not finish loading.',
        )
      } catch (workspaceError) {
        setError(getAuthErrorMessage(workspaceError))
      }

      const activeMembership = chooseActiveMembership(memberships, nextAccountType)
      setProfile(nextProfile)
      setUserRooms(memberships)
      setActiveRoom(activeMembership?.room || null)
      setMembershipRole(activeMembership?.role || '')
    } catch (nextError) {
      setError(getAuthErrorMessage(nextError))
      setProfile(createFallbackProfile(nextSession.user, preferredAccountType))
      setActiveRoom(null)
      setMembershipRole('')
      setUserRooms([])
    } finally {
      setRoomLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined
    }

    let mounted = true

    Promise.resolve().then(async () => {
      try {
        const { data, error: sessionError } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_REQUEST_TIMEOUT_MS,
          'Supabase session check timed out. Refresh the page and try again.',
        )

        if (!mounted) return

        if (sessionError) {
          setError(getAuthErrorMessage(sessionError))
        }

        setSession(data.session)
        await loadUserWorkspace(data.session)
      } catch (nextError) {
        if (mounted) {
          setError(getAuthErrorMessage(nextError))
          setSession(null)
          await loadUserWorkspace(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
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

      const accountTypeLabel = getAccountTypeLabel(accountType)
      setError('')

      try {
        const { data, error: signUpError } = await withTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                account_type: accountType,
                display_name: accountTypeLabel,
              },
            },
          }),
          AUTH_REQUEST_TIMEOUT_MS,
          'Signup timed out. Supabase did not respond within 20 seconds.',
        )

        if (signUpError) {
          throw signUpError
        }

        if (data.session) {
          setSession(data.session)
          await loadUserWorkspace(data.session, accountType)
        }

        return data
      } catch (nextError) {
        const message = getAuthErrorMessage(nextError)
        setError(message)
        throw new Error(message, { cause: nextError })
      }
    },
    [loadUserWorkspace],
  )

  const signIn = useCallback(
    async ({ email, password }) => {
      if (!isSupabaseConfigured) throw new Error(getSupabaseConfigError())

      setError('')
      try {
        const { data, error: signInError } = await withTimeout(
          supabase.auth.signInWithPassword({ email, password }),
          AUTH_REQUEST_TIMEOUT_MS,
          'Login timed out. Supabase did not respond within 20 seconds.',
        )

        if (signInError) {
          throw signInError
        }

        setSession(data.session)
        await loadUserWorkspace(data.session)
        return data
      } catch (nextError) {
        const message = getAuthErrorMessage(nextError)
        setError(message)
        throw new Error(message, { cause: nextError })
      }
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
    setUserRooms([])
    writeActiveRoomPreference('')
  }, [])

  const updateAccountType = useCallback(
    async (nextAccountType) => {
      if (!session?.user) throw new Error('Sign in before changing your account type.')
      if (!isSupabaseConfigured) throw new Error(getSupabaseConfigError())

      setRoomLoading(true)
      setError('')

      try {
        await updateProfileAccountType(session.user.id, nextAccountType)
        await loadUserWorkspace(session)
      } catch (nextError) {
        setError(nextError.message)
        throw nextError
      } finally {
        setRoomLoading(false)
      }
    },
    [loadUserWorkspace, session],
  )

  const createPrivateRoom = useCallback(async () => {
    if (!session?.user) throw new Error('Sign in before creating a private room.')
    if (!profile) throw new Error('Profile is still loading. Try again in a moment.')
    if (!isSupabaseConfigured) throw new Error(getSupabaseConfigError())

    setRoomLoading(true)
    setError('')

    try {
      const membership = await createPrivateRoomForUser(session.user, profile)
      writeActiveRoomPreference(membership.room.id)
      await loadUserWorkspace(session)
      return membership
    } catch (nextError) {
      setError(nextError.message)
      throw nextError
    } finally {
      setRoomLoading(false)
    }
  }, [loadUserWorkspace, profile, session])

  const setActiveRoomById = useCallback(
    (roomId) => {
      const membership = userRooms.find((item) => item.room?.id === roomId)
      if (!membership) throw new Error('You are not a member of that room.')

      writeActiveRoomPreference(roomId)
      setActiveRoom(membership.room)
      setMembershipRole(membership.role)
    },
    [userRooms],
  )

  const leaveRoom = useCallback(
    async (roomId) => {
      if (!session?.user) throw new Error('Sign in before leaving a room.')

      setRoomLoading(true)
      setError('')

      try {
        await leaveRoomForUser({ roomId, userId: session.user.id })
        if (activeRoom?.id === roomId) writeActiveRoomPreference('')
        await loadUserWorkspace(session)
      } catch (nextError) {
        setError(nextError.message)
        throw nextError
      } finally {
        setRoomLoading(false)
      }
    },
    [activeRoom, loadUserWorkspace, session],
  )

  const deleteRoom = useCallback(
    async (roomId) => {
      if (!session?.user) throw new Error('Sign in before deleting a room.')

      setRoomLoading(true)
      setError('')

      try {
        await deleteRoomForUser(roomId)
        if (activeRoom?.id === roomId) writeActiveRoomPreference('')
        await loadUserWorkspace(session)
      } catch (nextError) {
        setError(nextError.message)
        throw nextError
      } finally {
        setRoomLoading(false)
      }
    },
    [activeRoom, loadUserWorkspace, session],
  )

  const refreshWorkspace = useCallback(async () => {
    await loadUserWorkspace(session)
  }, [loadUserWorkspace, session])

  const realAccountType = getAccountType(profile, session?.user)
  const accountType = getEffectiveAccountType(profile, session?.user)

  const value = useMemo(
    () => ({
      activeRoom,
      accountType,
      accountTypeLabel: getAccountTypeLabel(accountType),
      authConfigured: isSupabaseConfigured,
      createPrivateRoom,
      deleteRoom,
      displayName: getDisplayName(profile, session?.user),
      error,
      leaveRoom,
      loading,
      membershipRole,
      profile,
      realAccountType,
      refreshWorkspace,
      roomLoading,
      session,
      setActiveRoomById,
      signIn,
      signOut,
      signUp,
      updateAccountType,
      user: session?.user || null,
      userRooms,
    }),
    [
      accountType,
      activeRoom,
      createPrivateRoom,
      deleteRoom,
      error,
      leaveRoom,
      loading,
      membershipRole,
      profile,
      realAccountType,
      refreshWorkspace,
      roomLoading,
      session,
      setActiveRoomById,
      signIn,
      signOut,
      signUp,
      updateAccountType,
      userRooms,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
