import { Navigate, Outlet } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { Sidebar } from '@/components/Sidebar'
import { MobileTopBar } from '@/components/MobileTopBar'

export function AppShell() {
  const currentUserId = useAppStore((s) => s.currentUserId)

  if (!currentUserId) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="relative flex min-h-dvh">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_15%_-10%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent)]"
      />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
