import { useState } from 'react'
import { CheckCircle2, Clock, Inbox, ListChecks, Star } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { TaskCard } from '@/components/TaskCard'
import { StatTile } from '@/components/StatTile'
import { EmptyState } from '@/components/EmptyState'
import { Badge } from '@/components/ui/badge'
import { StatusFilterBar, type TaskFilterValue } from '@/components/StatusFilterBar'
import { taskStatus } from '@/lib/task'
import { assessmentOverall, competencySkills } from '@/lib/skills'
import { competencyStyle } from '@/lib/colors'

export function EmployeeDashboard() {
  const currentUserId = useAppStore((s) => s.currentUserId)!
  const allTasks = useAppStore((s) => s.tasks)
  const assessments = useAppStore((s) => s.assessments)
  const tasks = allTasks.filter((t) => t.assigneeId === currentUserId)
  const [filter, setFilter] = useState<TaskFilterValue>('all')

  const filtered = tasks.filter((t) => filter === 'all' || taskStatus(t) === filter)
  const sorted = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const inProgress = tasks.filter((t) => taskStatus(t) === 'in_progress').length
  const pendingReview = tasks.filter((t) => taskStatus(t) === 'pending_review').length
  const completed = tasks.filter((t) => taskStatus(t) === 'completed').length

  const myAssessments = assessments.filter((a) => tasks.some((t) => t.id === a.taskId))
  const avgScore = myAssessments.length
    ? Math.round((myAssessments.reduce((sum, a) => sum + assessmentOverall(a), 0) / myAssessments.length) * 10) / 10
    : null

  const skills = [...competencySkills(tasks, myAssessments)].sort((a, b) => b.taskCount - a.taskCount)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Мои задачи развития</h1>
        <p className="mt-1 text-sm text-muted-foreground">Отслеживайте прогресс и делитесь результатами с руководителем</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={ListChecks} label="В процессе" value={inProgress} accent="text-blue-600 bg-blue-500/10" />
        <StatTile icon={Clock} label="На проверке" value={pendingReview} accent="text-amber-600 bg-amber-500/10" />
        <StatTile icon={CheckCircle2} label="Завершено" value={completed} accent="text-emerald-600 bg-emerald-500/10" />
        <StatTile
          icon={Star}
          label="Моя средняя оценка"
          value={avgScore !== null ? `${avgScore} / 5` : '—'}
          accent="text-violet-600 bg-violet-500/10"
        />
      </div>

      {skills.length > 0 && (
        <div className="mb-6 rounded-xl bg-card p-4 shadow-sm shadow-black/[0.02] ring-1 ring-foreground/10 dark:shadow-black/10">
          <h2 className="mb-3 text-sm font-medium">Мои навыки</h2>
          <div className="space-y-2">
            {skills.map((skill) => {
              const style = competencyStyle(skill.competency)
              return (
                <div key={skill.competency} className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className={`${style.text} border-current`}>
                    {skill.competency}
                  </Badge>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {skill.overall} / 5 · {skill.taskCount} {skill.taskCount === 1 ? 'задача' : 'задачи'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mb-6">
        <StatusFilterBar tasks={tasks} value={filter} onChange={setFilter} />
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={Inbox} message="Нет задач в этой категории." />
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
