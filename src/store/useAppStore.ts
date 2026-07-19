import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Assessment,
  AssessmentCriteria,
  ChecklistItem,
  ChecklistOwner,
  Comment,
  DevelopmentTask,
  QuestionType,
  User,
} from '@/types'
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
  deleteTask: (taskId: string) => void
  addEmployee: (input: { name: string; managerId: string }) => void
  addVerificationQuestion: (
    taskId: string,
    input: { text: string; type: QuestionType; options?: string[]; correctOptionIndex?: number },
  ) => void
  removeVerificationQuestion: (taskId: string, questionId: string) => void
  answerVerificationQuestion: (
    taskId: string,
    questionId: string,
    answer: { answerText?: string; selectedOptionIndex?: number },
  ) => void
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
              verificationQuestions: [],
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

      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
          comments: state.comments.filter((c) => c.taskId !== taskId),
          assessments: state.assessments.filter((a) => a.taskId !== taskId),
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

      addVerificationQuestion: (taskId, input) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  verificationQuestions: [
                    ...task.verificationQuestions,
                    {
                      id: crypto.randomUUID(),
                      text: input.text,
                      type: input.type,
                      options: input.options,
                      correctOptionIndex: input.correctOptionIndex,
                    },
                  ],
                }
              : task,
          ),
        })),

      removeVerificationQuestion: (taskId, questionId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, verificationQuestions: task.verificationQuestions.filter((q) => q.id !== questionId) }
              : task,
          ),
        })),

      answerVerificationQuestion: (taskId, questionId, answer) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  verificationQuestions: task.verificationQuestions.map((q) =>
                    q.id === questionId ? { ...q, ...answer, answeredAt: new Date().toISOString() } : q,
                  ),
                }
              : task,
          ),
        })),
    }),
    {
      name: 'skill-tracker-storage-v2',
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as AppState
        if (Array.isArray(state?.tasks)) {
          state.tasks = state.tasks.map((task) => ({
            ...task,
            verificationQuestions: Array.isArray(task.verificationQuestions) ? task.verificationQuestions : [],
          }))
        }
        return state
      },
    },
  ),
)
