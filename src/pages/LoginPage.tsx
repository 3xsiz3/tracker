import { Navigate, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { initials } from '@/lib/selectors'

export function LoginPage() {
  const navigate = useNavigate()
  const users = useAppStore((s) => s.users)
  const currentUserId = useAppStore((s) => s.currentUserId)
  const login = useAppStore((s) => s.login)

  if (currentUserId) {
    return <Navigate to="/" replace />
  }

  const managers = users.filter((u) => u.role === 'manager')
  const employees = users.filter((u) => u.role === 'employee')

  function handleLogin(userId: string) {
    login(userId)
    navigate('/')
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Развитие навыков</h1>
        <p className="mt-2 text-muted-foreground">
          Выберите пользователя, чтобы продолжить
        </p>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Руководители</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {managers.map((user) => (
            <UserCard key={user.id} name={user.name} avatarColor={user.avatarColor} onClick={() => handleLogin(user.id)} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Сотрудники</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {employees.map((user) => (
            <UserCard key={user.id} name={user.name} avatarColor={user.avatarColor} onClick={() => handleLogin(user.id)} />
          ))}
        </div>
      </section>
    </div>
  )
}

function UserCard({
  name,
  avatarColor,
  onClick,
}: {
  name: string
  avatarColor: string
  onClick: () => void
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="cursor-pointer transition-colors hover:bg-accent"
    >
      <CardContent className="flex items-center gap-3 py-4">
        <Avatar>
          <AvatarFallback className={`${avatarColor} text-white`}>{initials(name)}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{name}</span>
      </CardContent>
    </Card>
  )
}
