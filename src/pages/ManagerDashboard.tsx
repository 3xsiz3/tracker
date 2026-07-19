import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { AlertTriangle, CheckCircle2, Clock, ListChecks, Star, TrendingUp, Users } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { NewTaskDialog } from '@/components/NewTaskDialog'
import { AddEmployeeDialog } from '@/components/AddEmployeeDialog'
import { StatTile } from '@/components/StatTile'
import { initials } from '@/lib/selectors'
import { taskProgress, taskStatus } from '@/lib/task'
import { assessmentOverall } from '@/lib/skills'
import { isOverdue } from '@/lib/reports'
import { STATUS_LABELS } from '@/types'
import { STATUS_PILL } from '@/lib/colors'

export function ManagerDashboard() {
  const currentUserId = useAppStore((s) => s.currentUserId)!
  const users = useAppStore((s) => s.users)
  const tasks = useAppStore((s) => s.tasks)
  const assessments = useAppStore((s) => s.assessments)

  const reports = users.filter((u) => u.role === 'employee' && u.managerId === currentUserId)
  const teamTasks = tasks.filter((t) => reports.some((r) => r.id === t.assigneeId))
  const inProgress = teamTasks.filter((t) => taskStatus(t) === 'in_progress').length
  const completed = teamTasks.filter((t) => taskStatus(t) === 'completed').length
  const avgProgress = teamTasks.length
    ? Math.round(teamTasks.reduce((sum, t) => sum + taskProgress(t), 0) / teamTasks.length)
    : 0

  const attentionTasks = [...teamTasks]
    .filter((t) => taskStatus(t) === 'pending_review' || isOverdue(t))
    .sort((a, b) => Number(isOverdue(b)) - Number(isOverdue(a)))

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Моя команда</h1>
          <p className="text-sm text-muted-foreground">Задачи развития и прогресс ваших сотрудников</p>
        </div>
        <AddEmployeeDialog managerId={currentUserId} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Users} label="Сотрудников" value={reports.length} accent="text-violet-600 bg-violet-500/10" />
        <StatTile icon={ListChecks} label="В процессе" value={inProgress} accent="text-blue-600 bg-blue-500/10" />
        <StatTile icon={CheckCircle2} label="Завершено" value={completed} accent="text-emerald-600 bg-emerald-500/10" />
        <StatTile icon={TrendingUp} label="Средний прогресс" value={`${avgProgress}%`} accent="text-amber-600 bg-amber-500/10" />
      </div>

      {attentionTasks.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-medium">Нужно внимание</h2>
          <div className="space-y-2">
            {attentionTasks.map((task) => {
              const employee = reports.find((r) => r.id === task.assigneeId)
              const overdue = isOverdue(task)
              return (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {overdue ? (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                    ) : (
                      <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium">{task.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{employee?.name}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      overdue ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400' : STATUS_PILL.pending_review.className
                    }`}
                  >
                    {overdue ? 'Просрочено' : STATUS_LABELS.pending_review}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">У вас пока нет сотрудников в подчинении.</p>
      ) : (
        <>
          <h2 className="mb-3 text-sm font-medium">Сотрудники</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {reports.map((employee) => {
              const employeeTasks = tasks.filter((t) => t.assigneeId === employee.id)
              const employeeCompleted = employeeTasks.filter((t) => taskStatus(t) === 'completed').length
              const employeeAvgProgress = employeeTasks.length
                ? Math.round(employeeTasks.reduce((sum, t) => sum + taskProgress(t), 0) / employeeTasks.length)
                : 0
              const employeeOverdue = employeeTasks.filter(isOverdue).length

              const employeeScores = employeeTasks
                .map((t) => assessments.find((a) => a.taskId === t.id))
                .filter((a): a is NonNullable<typeof a> => !!a)
                .map((a) => assessmentOverall(a))
              const avgScore = employeeScores.length
                ? Math.round((employeeScores.reduce((sum, v) => sum + v, 0) / employeeScores.length) * 10) / 10
                : null

              const lastActivityAt = employeeTasks
                .flatMap((t) => t.history)
                .reduce<string | null>((latest, entry) => (!latest || entry.at > latest ? entry.at : latest), null)

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

                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
                      {avgScore !== null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-400">
                          <Star className="h-3 w-3" /> {avgScore} / 5
                        </span>
                      )}
                      {employeeOverdue > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-400">
                          <AlertTriangle className="h-3 w-3" /> {employeeOverdue} просрочено
                        </span>
                      )}
                      {lastActivityAt && (
                        <span className="text-xs text-muted-foreground">
                          Активность {formatDistanceToNow(new Date(lastActivityAt), { addSuffix: true, locale: ru })}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
