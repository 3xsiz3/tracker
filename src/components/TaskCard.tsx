import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarDays, ListChecks } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { DevelopmentTask } from '@/types'
import { STATUS_LABELS } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { taskProgress, taskStatus } from '@/lib/task'
import { competencyStyle, STATUS_PILL } from '@/lib/colors'
import { isOverdue } from '@/lib/reports'

export function TaskCard({ task }: { task: DevelopmentTask }) {
  const progress = taskProgress(task)
  const status = taskStatus(task)
  const style = competencyStyle(task.competency)
  const doneCount = task.checklist.filter((i) => i.done).length
  const overdue = isOverdue(task)

  return (
    <Link to={`/tasks/${task.id}`}>
      <Card className={`border-l-4 ${style.border} py-0 transition-shadow hover:shadow-md`}>
        <CardContent className="py-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="font-medium leading-snug">{task.title}</h3>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_PILL[status].className}`}>
              {STATUS_LABELS[status]}
            </span>
          </div>
          <p className={`mb-3 inline-block rounded px-1.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
            {task.competency}
          </p>
          <Progress value={progress} className="mb-2 h-1.5" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-3">
              <span>{progress}%</span>
              {task.checklist.length > 0 && (
                <span className="flex items-center gap-1">
                  <ListChecks className="h-3.5 w-3.5" />
                  {doneCount}/{task.checklist.length}
                </span>
              )}
            </span>
            {task.dueDate && (
              <span className={`flex items-center gap-1 ${overdue ? 'font-medium text-rose-600' : ''}`}>
                {overdue ? <AlertTriangle className="h-3.5 w-3.5" /> : <CalendarDays className="h-3.5 w-3.5" />}
                {format(new Date(task.dueDate), 'd MMM yyyy', { locale: ru })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
