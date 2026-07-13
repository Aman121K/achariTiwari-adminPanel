import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth(); const location = useLocation()
  return user ? <>{children}</> : <Navigate to="/login" state={{ from: location.pathname }} replace />
}
