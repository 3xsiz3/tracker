export type Role = 'manager' | 'employee'

export interface User {
  id: string
  name: string
  role: Role
  managerId?: string
  avatarColor: string
}

export type TaskStatus = 'not_started' | 'in_progress' | 'pending_review' | 'completed'

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
  confirmedAt?: string
  confirmedById?: string
  verificationQuestions: VerificationQuestion[]
}

export type QuestionType = 'open' | 'choice'

export interface VerificationQuestion {
  id: string
  text: string
  type: QuestionType
  options?: string[]
  correctOptionIndex?: number
  answerText?: string
  selectedOptionIndex?: number
  answeredAt?: string
}

export interface Comment {
  id: string
  taskId: string
  authorId: string
  text: string
  createdAt: string
}

export interface AssessmentCriteria {
  quality: number
  timeliness: number
  autonomy: number
}

export interface Assessment extends AssessmentCriteria {
  taskId: string
  assessedById: string
  assessedAt: string
}

export const ASSESSMENT_CRITERIA_LABELS: Record<keyof AssessmentCriteria, string> = {
  quality: 'Качество результата',
  timeliness: 'Соблюдение сроков',
  autonomy: 'Самостоятельность',
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Не начато',
  in_progress: 'В процессе',
  pending_review: 'На проверке',
  completed: 'Завершено',
}
