import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChecklistItem, ChecklistOwner, Comment, DevelopmentTask, User } from '@/types'
import { seedComments, seedTasks, seedUsers } from '@/store/seed'
import { taskProgress, taskStatus } from '@/lib/task'

function historyEntry(checklist: ChecklistItem[]) {
  const progress = taskProgress({ checklist })
  return { at: new Date().toISOString(), status: taskStatus({ checklist }), progress }
}

interface AppState {
  users: User[]
  tasks: DevelopmentTask[]
  comments: Comment[]
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
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      users: seedUsers,
      tasks: seedTasks,
      comments: seedComments,
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
              ? { ...task, checklist: items, history: [...task.history, historyEntry(items)] }
              : task,
          ),
        })),

      toggleChecklistItem: (taskId, itemId) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task
            const checklist = task.checklist.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it))
            return { ...task, checklist, history: [...task.history, historyEntry(checklist)] }
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
    }),
    { name: 'skill-tracker-storage-v2' },
  ),
)
