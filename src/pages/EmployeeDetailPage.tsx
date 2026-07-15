import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { TaskCard } from '@/components/TaskCard'
import { NewTaskDialog } from '@/components/NewTaskDialog'
import { initials } from '@/lib/selectors'
import { competencyStyle } from '@/lib/colors'
import { competencySkills } from '@/lib/skills'

export function EmployeeDetailPage() {
  const { employeeId } = useParams<{ employeeId: string }>()
  const currentUserId = useAppStore((s) => s.currentUserId)!
  const users = useAppStore((s) => s.users)
  const allTasks = useAppStore((s) => s.tasks)
  const allAssessments = useAppStore((s) => s.assessments)
  const tasks = allTasks.filter((t) => t.assigneeId === employeeId)
  const skills = competencySkills(
    tasks,
    allAssessments.filter((a) => tasks.some((t) => t.id === a.taskId)),
  ).sort((a, b) => b.taskCount - a.taskCount)

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

      {skills.length > 0 && (
        <div className="mb-6 rounded-xl border p-4">
          <h2 className="mb-3 text-sm font-medium">Навыки</h2>
          <div className="space-y-2">
            {skills.map((skill) => {
              const style = competencyStyle(skill.competency)
              return (
                <div key={skill.competency} className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className={`${style.text} border-current`}>
                    {skill.competency}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {skill.overall} / 5 · {skill.taskCount} {skill.taskCount === 1 ? 'задача' : 'задачи'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
