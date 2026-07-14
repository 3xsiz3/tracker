import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, ListChecks, LogOut, Sparkles, Users } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { initials } from '@/lib/selectors'

export function Sidebar() {
  const navigate = useNavigate()
  const currentUserId = useAppStore((s) => s.currentUserId)
  const users = useAppStore((s) => s.users)
  const logout = useAppStore((s) => s.logout)

  const currentUser = users.find((u) => u.id === currentUserId)
  if (!currentUser) return null

  const navItems =
    currentUser.role === 'manager'
      ? [{ to: '/manager', label: 'Команда', icon: Users }]
      : [{ to: '/employee', label: 'Мои задачи', icon: ListChecks }]

  return (
    <aside className="flex h-svh w-64 shrink-0 flex-col border-r bg-muted/20">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Развитие навыков</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`
          }
        >
          <LayoutGrid className="h-4 w-4" /> Обзор
        </NavLink>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`
            }
          >
            <Icon className="h-4 w-4" /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className={`${currentUser.avatarColor} text-white text-xs`}>
              {initials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-none">{currentUser.name}</p>
            <Badge variant="secondary" className="mt-1 text-[10px]">
              {currentUser.role === 'manager' ? 'Руководитель' : 'Сотрудник'}
            </Badge>
          </div>
        </div>
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
    </aside>
  )
}
