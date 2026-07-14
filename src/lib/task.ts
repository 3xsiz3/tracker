import type { DevelopmentTask, TaskStatus } from '@/types'

export function taskProgress(task: Pick<DevelopmentTask, 'checklist'>): number {
  if (task.checklist.length === 0) return 0
  return task.checklist.filter((item) => item.done).reduce((sum, item) => sum + item.weight, 0)
}

export function taskStatus(task: Pick<DevelopmentTask, 'checklist'>): TaskStatus {
  const progress = taskProgress(task)
  if (progress <= 0) return 'not_started'
  if (progress >= 100) return 'completed'
  return 'in_progress'
}

export function checklistWeightSum(items: { weight: number }[]): number {
  return items.reduce((sum, item) => sum + (Number.isFinite(item.weight) ? item.weight : 0), 0)
}

export function canEditChecklist(task: Pick<DevelopmentTask, 'checklistOwner' | 'assigneeId' | 'createdById'>, currentUserId: string) {
  const ownerId = task.checklistOwner === 'manager' ? task.createdById : task.assigneeId
  return ownerId === currentUserId
}
