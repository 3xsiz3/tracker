import { create } from 'zustand'
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
import { taskProgress, taskStatus } from '@/lib/task'
import { supabase } from '@/lib/supabase'

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
  loading: boolean

  setCurrentUserId: (userId: string | null) => void
  loadAll: () => Promise<void>
  reset: () => void
  logout: () => Promise<void>
  createTask: (input: {
    title: string
    description: string
    competency: string
    assigneeId: string
    createdById: string
    checklistOwner: ChecklistOwner
    checklist: ChecklistItem[]
    dueDate?: string
  }) => Promise<void>
  setChecklist: (taskId: string, items: ChecklistItem[]) => Promise<void>
  toggleChecklistItem: (taskId: string, itemId: string) => Promise<void>
  addComment: (taskId: string, authorId: string, text: string) => Promise<void>
  submitAssessment: (taskId: string, assessedById: string, criteria: AssessmentCriteria) => Promise<void>
  confirmTask: (taskId: string, confirmedById: string) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  addVerificationQuestion: (
    taskId: string,
    input: { text: string; type: QuestionType; options?: string[]; correctOptionIndex?: number },
  ) => Promise<void>
  removeVerificationQuestion: (taskId: string, questionId: string) => Promise<void>
  answerVerificationQuestion: (
    taskId: string,
    questionId: string,
    answer: { answerText?: string; selectedOptionIndex?: number },
  ) => Promise<void>
}

const emptyData = { users: [], tasks: [], comments: [], assessments: [], currentUserId: null, loading: false }

export const useAppStore = create<AppState>()((set, get) => ({
  users: [],
  tasks: [],
  comments: [],
  assessments: [],
  currentUserId: null,
  loading: false,

  setCurrentUserId: (userId) => set({ currentUserId: userId }),

  loadAll: async () => {
    set({ loading: true })
    const [profiles, tasks, comments, assessments] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('comments').select('*'),
      supabase.from('assessments').select('*'),
    ])
    set({
      users: profiles.data ?? [],
      tasks: tasks.data ?? [],
      comments: comments.data ?? [],
      assessments: assessments.data ?? [],
      loading: false,
    })
  },

  reset: () => set(emptyData),

  logout: async () => {
    await supabase.auth.signOut()
    set(emptyData)
  },

  createTask: async (input) => {
    const task: DevelopmentTask = {
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
    }
    set((state) => ({ tasks: [...state.tasks, task] }))
    const { error } = await supabase.from('tasks').insert(task)
    if (error) console.error('createTask failed', error)
  },

  setChecklist: async (taskId, items) => {
    const task = get().tasks.find((t) => t.id === taskId)
    if (!task) return
    const history = [...task.history, historyEntry(items)]
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, checklist: items, confirmedAt: undefined, confirmedById: undefined, history } : t,
      ),
    }))
    const { error } = await supabase
      .from('tasks')
      .update({ checklist: items, confirmedAt: null, confirmedById: null, history })
      .eq('id', taskId)
    if (error) console.error('setChecklist failed', error)
  },

  toggleChecklistItem: async (taskId, itemId) => {
    const task = get().tasks.find((t) => t.id === taskId)
    if (!task) return
    const checklist = task.checklist.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it))
    const history = [...task.history, historyEntry(checklist)]
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, checklist, confirmedAt: undefined, confirmedById: undefined, history } : t,
      ),
    }))
    const { error } = await supabase
      .from('tasks')
      .update({ checklist, confirmedAt: null, confirmedById: null, history })
      .eq('id', taskId)
    if (error) console.error('toggleChecklistItem failed', error)
  },

  addComment: async (taskId, authorId, text) => {
    const comment: Comment = { id: crypto.randomUUID(), taskId, authorId, text, createdAt: new Date().toISOString() }
    set((state) => ({ comments: [...state.comments, comment] }))
    const { error } = await supabase.from('comments').insert(comment)
    if (error) console.error('addComment failed', error)
  },

  submitAssessment: async (taskId, assessedById, criteria) => {
    const assessment: Assessment = { taskId, assessedById, assessedAt: new Date().toISOString(), ...criteria }
    set((state) => ({
      assessments: [...state.assessments.filter((a) => a.taskId !== taskId), assessment],
    }))
    const { error } = await supabase.from('assessments').upsert(assessment)
    if (error) console.error('submitAssessment failed', error)
  },

  confirmTask: async (taskId, confirmedById) => {
    const task = get().tasks.find((t) => t.id === taskId)
    if (!task) return
    const confirmedAt = new Date().toISOString()
    const history = [...task.history, { at: confirmedAt, status: 'completed' as const, progress: 100 }]
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, confirmedAt, confirmedById, history } : t)),
    }))
    const { error } = await supabase.from('tasks').update({ confirmedAt, confirmedById, history }).eq('id', taskId)
    if (error) console.error('confirmTask failed', error)
  },

  deleteTask: async (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      comments: state.comments.filter((c) => c.taskId !== taskId),
      assessments: state.assessments.filter((a) => a.taskId !== taskId),
    }))
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) console.error('deleteTask failed', error)
  },

  addVerificationQuestion: async (taskId, input) => {
    const task = get().tasks.find((t) => t.id === taskId)
    if (!task) return
    const verificationQuestions = [
      ...task.verificationQuestions,
      {
        id: crypto.randomUUID(),
        text: input.text,
        type: input.type,
        options: input.options,
        correctOptionIndex: input.correctOptionIndex,
      },
    ]
    set((state) => ({ tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, verificationQuestions } : t)) }))
    const { error } = await supabase.from('tasks').update({ verificationQuestions }).eq('id', taskId)
    if (error) console.error('addVerificationQuestion failed', error)
  },

  removeVerificationQuestion: async (taskId, questionId) => {
    const task = get().tasks.find((t) => t.id === taskId)
    if (!task) return
    const verificationQuestions = task.verificationQuestions.filter((q) => q.id !== questionId)
    set((state) => ({ tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, verificationQuestions } : t)) }))
    const { error } = await supabase.from('tasks').update({ verificationQuestions }).eq('id', taskId)
    if (error) console.error('removeVerificationQuestion failed', error)
  },

  answerVerificationQuestion: async (taskId, questionId, answer) => {
    const task = get().tasks.find((t) => t.id === taskId)
    if (!task) return
    const answeredAt = new Date().toISOString()
    const verificationQuestions = task.verificationQuestions.map((q) =>
      q.id === questionId ? { ...q, ...answer, answeredAt } : q,
    )
    set((state) => ({ tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, verificationQuestions } : t)) }))
    const { error } = await supabase.from('tasks').update({ verificationQuestions }).eq('id', taskId)
    if (error) console.error('answerVerificationQuestion failed', error)
  },
}))
