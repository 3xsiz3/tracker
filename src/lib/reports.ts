import { startOfWeek, subWeeks, format } from 'date-fns'
import type { Assessment, DevelopmentTask, User } from '@/types'
import { taskStatus } from '@/lib/task'
import { assessmentOverall } from '@/lib/skills'

export function isOverdue(task: DevelopmentTask): boolean {
  return !!task.dueDate && new Date(task.dueDate) < new Date() && taskStatus(task) !== 'completed'
}

export interface WeekBucket {
  weekStart: string
  label: string
  count: number
}

export function weeklyCompletions(tasks: DevelopmentTask[], weeks = 8): WeekBucket[] {
  const now = new Date()
  const buckets: WeekBucket[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 })
    buckets.push({ weekStart: weekStart.toISOString(), label: format(weekStart, 'd MMM'), count: 0 })
  }

  for (const task of tasks) {
    if (!task.confirmedAt) continue
    const weekStart = startOfWeek(new Date(task.confirmedAt), { weekStartsOn: 1 }).toISOString()
    const bucket = buckets.find((b) => b.weekStart === weekStart)
    if (bucket) bucket.count += 1
  }

  return buckets
}

export interface EmployeeReportRow {
  employeeId: string
  totalTasks: number
  completedTasks: number
  completionRate: number
  avgScore: number | null
  overdueCount: number
}

export function employeeReportRows(employees: User[], tasks: DevelopmentTask[], assessments: Assessment[]): EmployeeReportRow[] {
  return employees.map((employee) => {
    const employeeTasks = tasks.filter((t) => t.assigneeId === employee.id)
    const completedTasks = employeeTasks.filter((t) => taskStatus(t) === 'completed').length
    const scores = employeeTasks
      .map((t) => assessments.find((a) => a.taskId === t.id))
      .filter((a): a is Assessment => !!a)
      .map((a) => assessmentOverall(a))

    return {
      employeeId: employee.id,
      totalTasks: employeeTasks.length,
      completedTasks,
      completionRate: employeeTasks.length ? Math.round((completedTasks / employeeTasks.length) * 100) : 0,
      avgScore: scores.length ? Math.round((scores.reduce((sum, v) => sum + v, 0) / scores.length) * 10) / 10 : null,
      overdueCount: employeeTasks.filter(isOverdue).length,
    }
  })
}
