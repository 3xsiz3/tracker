import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { TaskCard } from '@/components/TaskCard'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TaskStatus } from '@/types'
import { STATUS_LABELS } from '@/types'
import { taskStatus } from '@/lib/task'

type FilterValue = TaskStatus | 'all'

export function EmployeeDashboard() {
  const currentUserId = useAppStore((s) => s.currentUserId)!
  const allTasks = useAppStore((s) => s.tasks)
  const tasks = allTasks.filter((t) => t.assigneeId === currentUserId)
  const [filter, setFilter] = useState<FilterValue>('all')

  const filtered = tasks.filter((t) => filter === 'all' || taskStatus(t) === filter)
  const sorted = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Мои задачи развития</h1>
        <p className="text-sm text-muted-foreground">Отслеживайте прогресс и делитесь результатами с руководителем</p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterValue)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Все ({tasks.length})</TabsTrigger>
          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
            <TabsTrigger key={status} value={status}>
              {STATUS_LABELS[status]} ({tasks.filter((t) => taskStatus(t) === status).length})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">Нет задач в этой категории.</p>
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
