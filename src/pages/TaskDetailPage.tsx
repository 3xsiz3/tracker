import { Link, Navigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChecklistView } from '@/components/ChecklistView'
import { AssessmentPanel } from '@/components/AssessmentPanel'
import { CommentThread } from '@/components/CommentThread'
import { STATUS_LABELS } from '@/types'
import { taskProgress, taskStatus } from '@/lib/task'
import { userLabel } from '@/lib/selectors'

const statusVariant = {
  not_started: 'outline',
  in_progress: 'default',
  pending_review: 'default',
  completed: 'secondary',
} as const

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const currentUserId = useAppStore((s) => s.currentUserId)!
  const users = useAppStore((s) => s.users)
  const task = useAppStore((s) => s.tasks.find((t) => t.id === taskId))
  const confirmTask = useAppStore((s) => s.confirmTask)

  if (!task) return <Navigate to="/" replace />

  const isAssignee = task.assigneeId === currentUserId
  const isCreator = task.createdById === currentUserId
  if (!isAssignee && !isCreator) {
    return <Navigate to="/" replace />
  }

  const progress = taskProgress(task)
  const status = taskStatus(task)
  const backHref = isCreator ? `/manager/employees/${task.assigneeId}` : '/employee'
  const history = [...task.history].sort((a, b) => b.at.localeCompare(a.at))

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={backHref} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Назад
      </Link>

      <div className="mb-1 flex items-start justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight">{task.title}</h1>
        <Badge variant="outline">{task.competency}</Badge>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Сотрудник: {userLabel(users, task.assigneeId)} · Поставил: {userLabel(users, task.createdById)}
        {task.dueDate && <> · срок до {format(new Date(task.dueDate), 'd MMM yyyy')}</>}
      </p>

      <Card className="mb-6">
        <CardContent className="py-4">
          <p className="text-sm">{task.description || 'Без описания.'}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Прогресс</h2>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant[status]}>{STATUS_LABELS[status]}</Badge>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />

          {status === 'pending_review' && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="text-sm text-amber-800 dark:text-amber-400">
                {isCreator
                  ? 'Все условия выполнены — подтвердите завершение задачи.'
                  : 'Задача выполнена и ожидает подтверждения руководителя.'}
              </p>
              {isCreator && (
                <Button size="sm" onClick={() => confirmTask(task.id, currentUserId)}>
                  Принять
                </Button>
              )}
            </div>
          )}

          <div className="pt-1">
            <ChecklistView task={task} currentUserId={currentUserId} />
          </div>

          {history.length > 1 && (
            <div className="border-t pt-3">
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">История изменений</h3>
              <ul className="space-y-1.5">
                {history.map((entry, i) => (
                  <li key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {STATUS_LABELS[entry.status]} · {entry.progress}%
                    </span>
                    <span>{format(new Date(entry.at), 'd MMM yyyy, HH:mm')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <AssessmentPanel task={task} currentUserId={currentUserId} />

      <div>
        <h2 className="mb-3 text-sm font-medium">Комментарии</h2>
        <CommentThread taskId={task.id} currentUserId={currentUserId} />
      </div>
    </div>
  )
}
