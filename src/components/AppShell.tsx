import { Navigate, Outlet } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { Sidebar } from '@/components/Sidebar'

export function AppShell() {
  const currentUserId = useAppStore((s) => s.currentUserId)

  if (!currentUserId) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-svh bg-muted/10">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
