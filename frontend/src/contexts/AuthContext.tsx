import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../lib/api'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  token: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sh_token'))
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = !!token

  useEffect(() => {
    if (token) {
      localStorage.setItem('sh_token', token)
    } else {
      localStorage.removeItem('sh_token')
    }
  }, [token])

  async function login(email: string, password: string) {
    setIsLoading(true)
    try {
      const res = await api.adminLogin(email, password)
      setToken(res.token)
    } finally {
      setIsLoading(false)
    }
  }

  function logout() {
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
