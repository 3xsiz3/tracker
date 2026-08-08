import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, LayoutGrid, ListChecks, LogOut, Sparkles, Users } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'
import { initials } from '@/lib/selectors'

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUserId = useAppStore((s) => s.currentUserId)
  const users = useAppStore((s) => s.users)
  const logout = useAppStore((s) => s.logout)

  const currentUser = users.find((u) => u.id === currentUserId)
  if (!currentUser) return null

  const navItems =
    currentUser.role === 'manager'
      ? [
          {
            to: '/manager',
            label: 'Команда',
            icon: Users,
            isActive: location.pathname === '/manager' || location.pathname.startsWith('/manager/employees'),
          },
          {
            to: '/manager/reports',
            label: 'Отчётность',
            icon: BarChart3,
            isActive: location.pathname.startsWith('/manager/reports'),
          },
        ]
      : [{ to: '/employee', label: 'Мои задачи', icon: ListChecks, isActive: location.pathname.startsWith('/employee') }]

  const linkClass = (isActive: boolean) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
        : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground'
    }`

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground ring-1 ring-inset ring-white/15">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Развитие навыков</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        <NavLink to="/" end onClick={onNavigate} className={({ isActive }) => linkClass(isActive)}>
          <LayoutGrid className="h-4 w-4" /> Обзор
        </NavLink>
        {navItems.map(({ to, label, icon: Icon, isActive }) => (
          <NavLink key={to} to={to} onClick={onNavigate} className={linkClass(isActive)}>
            <Icon className="h-4 w-4" /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="mb-1 flex items-center gap-2.5 rounded-lg px-2 py-2">
          <Avatar className="h-9 w-9 shrink-0 ring-2 ring-sidebar">
            <AvatarFallback className={`${currentUser.avatarColor} text-white text-xs`}>
              {initials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-none">{currentUser.name}</p>
            <Badge variant="secondary" className="mt-1.5 text-[10px]">
              {currentUser.role === 'manager' ? 'Руководитель' : 'Сотрудник'}
            </Badge>
          </div>
        </div>
        <Separator className="my-2 bg-sidebar-border" />
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          <LogOut className="h-4 w-4" /> Сменить пользователя
        </Button>
      </div>
    </div>
  )
}
