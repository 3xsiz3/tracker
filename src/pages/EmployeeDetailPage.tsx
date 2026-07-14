import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TaskCard } from '@/components/TaskCard'
import { NewTaskDialog } from '@/components/NewTaskDialog'
import { initials } from '@/lib/selectors'

export function EmployeeDetailPage() {
  const { employeeId } = useParams<{ employeeId: string }>()
  const currentUserId = useAppStore((s) => s.currentUserId)!
  const users = useAppStore((s) => s.users)
  const allTasks = useAppStore((s) => s.tasks)
  const tasks = allTasks.filter((t) => t.assigneeId === employeeId)

  const employee = users.find((u) => u.id === employeeId)

  if (!employee || employee.managerId !== currentUserId) {
    return <Navigate to="/manager" replace />
  }

  const sorted = [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div>
      <Link to="/manager" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Назад к команде
      </Link>

      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={`${employee.avatarColor} text-white`}>{initials(employee.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{employee.name}</h1>
            <p className="text-sm text-muted-foreground">{tasks.length} задач развития</p>
          </div>
        </div>
        <NewTaskDialog assigneeId={employee.id} createdById={currentUserId} />
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">Пока нет задач. Создайте первую задачу развития.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sorted.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}
