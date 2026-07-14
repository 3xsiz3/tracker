export type Role = 'manager' | 'employee'

export interface User {
  id: string
  name: string
  role: Role
  managerId?: string
  avatarColor: string
}

export type TaskStatus = 'not_started' | 'in_progress' | 'completed'

export interface ProgressEntry {
  at: string
  status: TaskStatus
  progress: number
}

export interface ChecklistItem {
  id: string
  label: string
  weight: number
  done: boolean
}

export type ChecklistOwner = 'manager' | 'employee'

export interface DevelopmentTask {
  id: string
  title: string
  description: string
  competency: string
  assigneeId: string
  createdById: string
  checklistOwner: ChecklistOwner
  checklist: ChecklistItem[]
  dueDate?: string
  createdAt: string
  history: ProgressEntry[]
}

export interface Comment {
  id: string
  taskId: string
  authorId: string
  text: string
  createdAt: string
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Не начато',
  in_progress: 'В процессе',
  completed: 'Завершено',
}
