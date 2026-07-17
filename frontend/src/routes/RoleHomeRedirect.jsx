import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function RoleHomeRedirect() {
  const { user } = useAuth()
  if (user?.role === 'admin') return <Navigate to="/app/admin" replace />
  if (user?.role === 'recruiter') return <Navigate to="/app/recruiter" replace />
  return <Navigate to="/app/student" replace />
}
