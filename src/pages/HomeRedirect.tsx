import { Navigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'

export function HomeRedirect() {
  const currentUserId = useAppStore((s) => s.currentUserId)
  const users = useAppStore((s) => s.users)
  const currentUser = users.find((u) => u.id === currentUserId)

  if (!currentUser) return <Navigate to="/login" replace />
  return <Navigate to={currentUser.role === 'manager' ? '/manager' : '/employee'} replace />
}
