import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function RequireAuth({ roles }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && !roles.includes(user.role)) {
    const home =
      user.role === 'admin'
        ? '/app/admin'
        : user.role === 'recruiter'
          ? '/app/recruiter'
          : '/app/student'
    return <Navigate to={home} replace />
  }

  return <Outlet />
}

export function GuestOnly() {
  const { isAuthenticated, user } = useAuth()
  if (isAuthenticated) {
    const home =
      user.role === 'admin'
        ? '/app/admin'
        : user.role === 'recruiter'
          ? '/app/recruiter'
          : '/app/student'
    return <Navigate to={home} replace />
  }
  return <Outlet />
}
