import { Link } from 'react-router-dom'
import { CheckCircle2, ListChecks, TrendingUp, Users } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { NewTaskDialog } from '@/components/NewTaskDialog'
import { StatTile } from '@/components/StatTile'
import { initials } from '@/lib/selectors'
import { taskProgress, taskStatus } from '@/lib/task'

export function ManagerDashboard() {
  const currentUserId = useAppStore((s) => s.currentUserId)!
  const users = useAppStore((s) => s.users)
  const tasks = useAppStore((s) => s.tasks)

  const reports = users.filter((u) => u.role === 'employee' && u.managerId === currentUserId)
  const teamTasks = tasks.filter((t) => reports.some((r) => r.id === t.assigneeId))
  const inProgress = teamTasks.filter((t) => taskStatus(t) === 'in_progress').length
  const completed = teamTasks.filter((t) => taskStatus(t) === 'completed').length
  const avgProgress = teamTasks.length
    ? Math.round(teamTasks.reduce((sum, t) => sum + taskProgress(t), 0) / teamTasks.length)
    : 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Моя команда</h1>
        <p className="text-sm text-muted-foreground">Задачи развития и прогресс ваших сотрудников</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Users} label="Сотрудников" value={reports.length} accent="text-violet-600 bg-violet-500/10" />
        <StatTile icon={ListChecks} label="В процессе" value={inProgress} accent="text-blue-600 bg-blue-500/10" />
        <StatTile icon={CheckCircle2} label="Завершено" value={completed} accent="text-emerald-600 bg-emerald-500/10" />
        <StatTile icon={TrendingUp} label="Средний прогресс" value={`${avgProgress}%`} accent="text-amber-600 bg-amber-500/10" />
      </div>

      {reports.length === 0 && (
        <p className="text-sm text-muted-foreground">У вас пока нет сотрудников в подчинении.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reports.map((employee) => {
          const employeeTasks = tasks.filter((t) => t.assigneeId === employee.id)
          const employeeCompleted = employeeTasks.filter((t) => taskStatus(t) === 'completed').length
          const employeeAvgProgress = employeeTasks.length
            ? Math.round(employeeTasks.reduce((sum, t) => sum + taskProgress(t), 0) / employeeTasks.length)
            : 0

          return (
            <Card key={employee.id} className="border-none shadow-sm">
              <CardContent className="py-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <Link to={`/manager/employees/${employee.id}`} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-background">
                      <AvatarFallback className={`${employee.avatarColor} text-white`}>
                        {initials(employee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium leading-none">{employee.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {employeeTasks.length} задач · {employeeCompleted} завершено
                      </p>
                    </div>
                  </Link>
                  <NewTaskDialog assigneeId={employee.id} createdById={currentUserId} />
                </div>
                <Progress value={employeeAvgProgress} className="h-2" />
                <p className="mt-2 text-xs text-muted-foreground">Средний прогресс: {employeeAvgProgress}%</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
