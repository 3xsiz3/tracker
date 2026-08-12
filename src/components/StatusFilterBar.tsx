import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { DevelopmentTask, TaskStatus } from '@/types'
import { taskStatus } from '@/lib/task'
import { STATUS_META } from '@/lib/colors'

export type TaskFilterValue = TaskStatus | 'all'

const ORDER: TaskStatus[] = ['not_started', 'in_progress', 'pending_review', 'completed']

export function StatusFilterBar({
  tasks,
  value,
  onChange,
}: {
  tasks: DevelopmentTask[]
  value: TaskFilterValue
  onChange: (value: TaskFilterValue) => void
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as TaskFilterValue)}>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <TabsList>
          <TabsTrigger value="all">Все ({tasks.length})</TabsTrigger>
          {ORDER.map((status) => {
            const meta = STATUS_META[status]
            const Icon = meta.icon
            const count = tasks.filter((t) => taskStatus(t) === status).length
            return (
              <TabsTrigger key={status} value={status} className="gap-1">
                <Icon className="h-3.5 w-3.5" /> {meta.label} ({count})
              </TabsTrigger>
            )
          })}
        </TabsList>
      </div>
    </Tabs>
  )
}
