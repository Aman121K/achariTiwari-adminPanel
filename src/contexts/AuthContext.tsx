import { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api'

type AdminUser = { id: string; name: string; email: string; role: string }
interface AuthContextValue { user: AdminUser | null; loading: boolean; login(email:string,password:string):Promise<void>; logout():void }

export const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try { return JSON.parse(localStorage.getItem('adminUser') || 'null') } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const value = useMemo(() => ({
    user, loading,
    login: async (email:string,password:string) => {
      setLoading(true)
      try {
        const data = await apiRequest('/auth/login',{method:'POST',body:JSON.stringify({email,password})})
        if (data.user?.role !== 'admin') throw new Error('This account does not have admin access.')
        localStorage.setItem('adminToken',data.token); localStorage.setItem('adminUser',JSON.stringify(data.user)); setUser(data.user)
      } finally { setLoading(false) }
    },
    logout: () => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); setUser(null) },
  }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value }
