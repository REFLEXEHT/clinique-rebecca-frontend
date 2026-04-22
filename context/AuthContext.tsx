'use client'
// context/AuthContext.tsx — Gestion de l'authentification globale
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Role } from '@/types'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  role: Role | null
  login: (token: string, user: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null, token: null, isAuthenticated: false, role: null,
  login: () => {}, logout: () => {}, loading: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const t = localStorage.getItem('rb_token')
    const u = localStorage.getItem('rb_user')
    if (t && u) {
      try {
        setToken(t)
        setUser(JSON.parse(u))
      } catch {}
    }
    setLoading(false)
  }, [])

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('rb_token', newToken)
    localStorage.setItem('rb_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('rb_token')
    localStorage.removeItem('rb_user')
    setToken(null)
    setUser(null)
  }

  if (!mounted) return <>{children}</>

  return (
    <AuthContext.Provider value={{
      user, token,
      isAuthenticated: !!user && !!token,
      role: user?.role || null,
      login, logout, loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// HOC de protection des routes
export function withAuth(roles: Role[]) {
  return function(Component: React.ComponentType<any>) {
    return function ProtectedRoute(props: any) {
      const { isAuthenticated, role, loading } = useAuth()
      useEffect(() => {
        if (!loading && (!isAuthenticated || (roles.length > 0 && !roles.includes(role!)))) {
          window.location.href = '/login'
        }
      }, [isAuthenticated, role, loading])
      if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      return <Component {...props} />
    }
  }
}