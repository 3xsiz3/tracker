import { SidebarNav } from '@/components/SidebarNav'

export function Sidebar() {
  return (
    <aside className="hidden h-svh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <SidebarNav />
    </aside>
  )
}
