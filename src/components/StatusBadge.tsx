import type { DevelopmentTask } from '@/types'
import { isOverdue, taskStatus } from '@/lib/task'
import { STATUS_META } from '@/lib/colors'
import { cn } from '@/lib/utils'

export function StatusBadge({
  task,
  className,
}: {
  task: Pick<DevelopmentTask, 'checklist' | 'confirmedAt' | 'dueDate'>
  className?: string
}) {
  const meta = STATUS_META[taskStatus(task)]
  const Icon = meta.icon
  const overdue = isOverdue(task)
  const overdueMeta = STATUS_META.overdue
  const OverdueIcon = overdueMeta.icon
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1.5', className)}>
      <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', meta.className)}>
        <Icon className="h-3 w-3" />
        {meta.label}
      </span>
      {overdue && (
        <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', overdueMeta.className)}>
          <OverdueIcon className="h-3 w-3" />
          {overdueMeta.label}
        </span>
      )}
    </span>
  )
}
