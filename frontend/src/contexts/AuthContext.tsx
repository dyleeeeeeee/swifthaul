import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../lib/api'

type Role = 'super_admin' | 'admin'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  role: Role | null
  adminName: string | null
  adminEmail: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  token: string | null
}

function decodeJWT(token: string): { sub: string; email: string; name?: string; role: Role } | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload
  } catch {
    return null
  }
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sh_token'))
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = !!token

  const decoded = token ? decodeJWT(token) : null
  const role: Role | null = decoded?.role ?? null
  const adminName: string | null = decoded?.name ?? null
  const adminEmail: string | null = decoded?.email ?? null

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
    <AuthContext.Provider value={{ isAuthenticated, isLoading, role, adminName, adminEmail, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
