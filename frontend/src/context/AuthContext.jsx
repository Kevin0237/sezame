import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '@/api/client'

const AuthContext = createContext(null)

const TOKEN_KEY = 'sezame_token'
const REFRESH_KEY = 'sezame_refresh_token'
const USER_KEY = 'sezame_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  }, [user])

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  }, [token])

  const value = useMemo(() => {
    async function login(email, password) {
      setLoading(true)
      try {
        const res = await api.auth.login({ email, password })
        setToken(res.token)
        if (res.refreshToken) localStorage.setItem(REFRESH_KEY, res.refreshToken)
        setUser(res.user)
        return res.user
      } finally {
        setLoading(false)
      }
    }

    async function register(payload) {
      setLoading(true)
      try {
        const result = await api.auth.register(payload)
        return result
      } finally {
        setLoading(false)
      }
    }

    async function logout() {
      const refreshToken = localStorage.getItem(REFRESH_KEY)
      try {
        await api.auth.logout(refreshToken)
      } finally {
        setToken(null)
        setUser(null)
        localStorage.removeItem(REFRESH_KEY)
      }
    }

    function updateUser(partial) {
      setUser((prev) => (prev ? { ...prev, ...partial } : prev))
    }

    return {
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      updateUser,
    }
  }, [user, token, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
