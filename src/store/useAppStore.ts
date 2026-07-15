import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Assessment, AssessmentCriteria, ChecklistItem, ChecklistOwner, Comment, DevelopmentTask, User } from '@/types'
import { seedAssessments, seedComments, seedTasks, seedUsers } from '@/store/seed'
import { taskProgress, taskStatus } from '@/lib/task'
import { avatarColorForIndex } from '@/lib/colors'

function historyEntry(checklist: ChecklistItem[]) {
  const progress = taskProgress({ checklist })
  return { at: new Date().toISOString(), status: taskStatus({ checklist }), progress }
}

interface AppState {
  users: User[]
  tasks: DevelopmentTask[]
  comments: Comment[]
  assessments: Assessment[]
  currentUserId: string | null

  login: (userId: string) => void
  logout: () => void
  createTask: (input: {
    title: string
    description: string
    competency: string
    assigneeId: string
    createdById: string
    checklistOwner: ChecklistOwner
    checklist: ChecklistItem[]
    dueDate?: string
  }) => void
  setChecklist: (taskId: string, items: ChecklistItem[]) => void
  toggleChecklistItem: (taskId: string, itemId: string) => void
  addComment: (taskId: string, authorId: string, text: string) => void
  submitAssessment: (taskId: string, assessedById: string, criteria: AssessmentCriteria) => void
  confirmTask: (taskId: string, confirmedById: string) => void
  addEmployee: (input: { name: string; managerId: string }) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      users: seedUsers,
      tasks: seedTasks,
      comments: seedComments,
      assessments: seedAssessments,
      currentUserId: null,

      login: (userId) => set({ currentUserId: userId }),
      logout: () => set({ currentUserId: null }),

      createTask: (input) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: crypto.randomUUID(),
              title: input.title,
              description: input.description,
              competency: input.competency,
              assigneeId: input.assigneeId,
              createdById: input.createdById,
              checklistOwner: input.checklistOwner,
              checklist: input.checklist,
              dueDate: input.dueDate,
              createdAt: new Date().toISOString(),
              history: [historyEntry(input.checklist)],
            },
          ],
        })),

      setChecklist: (taskId, items) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  checklist: items,
                  confirmedAt: undefined,
                  confirmedById: undefined,
                  history: [...task.history, historyEntry(items)],
                }
              : task,
          ),
        })),

      toggleChecklistItem: (taskId, itemId) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task
            const checklist = task.checklist.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it))
            return {
              ...task,
              checklist,
              confirmedAt: undefined,
              confirmedById: undefined,
              history: [...task.history, historyEntry(checklist)],
            }
          }),
        })),

      addComment: (taskId, authorId, text) =>
        set((state) => ({
          comments: [
            ...state.comments,
            {
              id: crypto.randomUUID(),
              taskId,
              authorId,
              text,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      submitAssessment: (taskId, assessedById, criteria) =>
        set((state) => ({
          assessments: [
            ...state.assessments.filter((a) => a.taskId !== taskId),
            { taskId, assessedById, assessedAt: new Date().toISOString(), ...criteria },
          ],
        })),

      confirmTask: (taskId, confirmedById) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task
            const confirmedAt = new Date().toISOString()
            return {
              ...task,
              confirmedAt,
              confirmedById,
              history: [...task.history, { at: confirmedAt, status: 'completed', progress: 100 }],
            }
          }),
        })),

      addEmployee: (input) =>
        set((state) => ({
          users: [
            ...state.users,
            {
              id: crypto.randomUUID(),
              name: input.name,
              role: 'employee',
              managerId: input.managerId,
              avatarColor: avatarColorForIndex(state.users.length),
            },
          ],
        })),
    }),
    { name: 'skill-tracker-storage-v2' },
  ),
)
