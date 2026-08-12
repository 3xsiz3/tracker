import { create } from 'zustand'
import type {
  Assessment,
  AssessmentCriteria,
  Attachment,
  ChecklistItem,
  ChecklistOwner,
  Comment,
  DevelopmentTask,
  FileComment,
  FileVersion,
  ProgressEntry,
  ProjectFile,
  QuestionType,
  User,
} from '@/types'
import { taskProgress, taskStatus } from '@/lib/task'
import { ATTACHMENTS_BUCKET, supabase } from '@/lib/supabase'
import { safeStorageKey } from '@/lib/utils'

function historyEntry(checklist: ChecklistItem[], note?: string): ProgressEntry {
  const progress = taskProgress({ checklist })
  const entry: ProgressEntry = { at: new Date().toISOString(), status: taskStatus({ checklist }), progress }
  if (note) entry.note = note
  return entry
}

interface AppState {
  users: User[]
  tasks: DevelopmentTask[]
  comments: Comment[]
  assessments: Assessment[]
  files: ProjectFile[]
  fileComments: FileComment[]
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
  addComment: (taskId: string, authorId: string, text: string, files?: File[]) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
  uploadFile: (input: { file: File; uploadedById: string; note: string; taskId?: string; visibleTo: string[] }) => Promise<void>
  addFileVersion: (fileId: string, file: File, uploadedById: string) => Promise<void>
  deleteFile: (fileId: string) => Promise<void>
  setFileAccess: (fileId: string, visibleTo: string[]) => Promise<void>
  addFileComment: (fileId: string, authorId: string, text: string, files?: File[]) => Promise<void>
  deleteFileComment: (commentId: string) => Promise<void>
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

const emptyData = {
  users: [],
  tasks: [],
  comments: [],
  assessments: [],
  files: [],
  fileComments: [],
  currentUserId: null,
  loading: false,
}

export const useAppStore = create<AppState>()((set, get) => ({
  users: [],
  tasks: [],
  comments: [],
  assessments: [],
  files: [],
  fileComments: [],
  currentUserId: null,
  loading: false,

  setCurrentUserId: (userId) => set({ currentUserId: userId }),

  loadAll: async () => {
    set({ loading: true })
    const [profiles, tasks, comments, assessments, files, fileComments] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('comments').select('*'),
      supabase.from('assessments').select('*'),
      supabase.from('files').select('*'),
      supabase.from('file_comments').select('*'),
    ])
    set({
      users: profiles.data ?? [],
      tasks: tasks.data ?? [],
      comments: comments.data ?? [],
      assessments: assessments.data ?? [],
      files: files.data ?? [],
      fileComments: fileComments.data ?? [],
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
    const history = [...task.history, historyEntry(items, 'Изменён список условий выполнения')]
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
    const item = task.checklist.find((it) => it.id === itemId)
    const checklist = task.checklist.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it))
    const note = item
      ? `${item.done ? 'Снята отметка о выполнении' : 'Отмечено выполненным'}: «${item.label}»`
      : undefined
    const history = [...task.history, historyEntry(checklist, note)]
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

  addComment: async (taskId, authorId, text, files) => {
    const id = crypto.randomUUID()
    const task = get().tasks.find((t) => t.id === taskId)
    const attachments: Attachment[] = []
    const libraryFiles: ProjectFile[] = []
    for (const file of files ?? []) {
      const path = `${taskId}/${id}/${safeStorageKey(file.name)}`
      const { error: uploadError } = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(path, file)
      if (uploadError) {
        console.error('attachment upload failed', uploadError)
        continue
      }
      attachments.push({ name: file.name, path, size: file.size, type: file.type })
      const versionCreatedAt = new Date().toISOString()
      libraryFiles.push({
        id: crypto.randomUUID(),
        name: file.name,
        note: task ? `Вложение к комментарию в задаче «${task.title}»` : 'Вложение к комментарию',
        uploadedById: authorId,
        taskId,
        createdAt: versionCreatedAt,
        visibleTo: [],
        versions: [{ fileName: file.name, path, size: file.size, type: file.type, uploadedById: authorId, createdAt: versionCreatedAt }],
      })
    }
    const comment: Comment = { id, taskId, authorId, text, createdAt: new Date().toISOString(), attachments }
    set((state) => ({ comments: [...state.comments, comment], files: [...state.files, ...libraryFiles] }))
    const { error } = await supabase.from('comments').insert(comment)
    if (error) console.error('addComment failed', error)
    if (libraryFiles.length > 0) {
      const { error: filesError } = await supabase.from('files').insert(libraryFiles)
      if (filesError) console.error('addComment file registration failed', filesError)
    }
  },

  deleteComment: async (commentId) => {
    set((state) => ({ comments: state.comments.filter((c) => c.id !== commentId) }))
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (error) console.error('deleteComment failed', error)
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
    const history = [
      ...task.history,
      { at: confirmedAt, status: 'completed' as const, progress: 100, note: 'Задача принята руководителем' },
    ]
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

  uploadFile: async ({ file, uploadedById, note, taskId, visibleTo }) => {
    const id = crypto.randomUUID()
    const path = `library/${id}/${safeStorageKey(file.name)}`
    const { error: uploadError } = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(path, file)
    if (uploadError) {
      console.error('uploadFile failed', uploadError)
      return
    }
    const createdAt = new Date().toISOString()
    const record: ProjectFile = {
      id,
      name: file.name,
      note,
      uploadedById,
      taskId,
      createdAt,
      visibleTo,
      versions: [{ fileName: file.name, path, size: file.size, type: file.type, uploadedById, createdAt }],
    }
    set((state) => ({ files: [...state.files, record] }))
    const { error } = await supabase.from('files').insert(record)
    if (error) console.error('uploadFile insert failed', error)
  },

  addFileVersion: async (fileId, file, uploadedById) => {
    const existing = get().files.find((f) => f.id === fileId)
    if (!existing) return
    const path = `library/${fileId}/${crypto.randomUUID()}-${safeStorageKey(file.name)}`
    const { error: uploadError } = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(path, file)
    if (uploadError) {
      console.error('addFileVersion failed', uploadError)
      return
    }
    const version: FileVersion = {
      fileName: file.name,
      path,
      size: file.size,
      type: file.type,
      uploadedById,
      createdAt: new Date().toISOString(),
    }
    const versions = [...existing.versions, version]
    set((state) => ({ files: state.files.map((f) => (f.id === fileId ? { ...f, name: file.name, versions } : f)) }))
    const { error } = await supabase.from('files').update({ name: file.name, versions }).eq('id', fileId)
    if (error) console.error('addFileVersion update failed', error)
  },

  deleteFile: async (fileId) => {
    const file = get().files.find((f) => f.id === fileId)
    set((state) => ({
      files: state.files.filter((f) => f.id !== fileId),
      fileComments: state.fileComments.filter((c) => c.fileId !== fileId),
    }))
    const { error } = await supabase.from('files').delete().eq('id', fileId)
    if (error) console.error('deleteFile failed', error)
    if (file) {
      const { error: storageError } = await supabase.storage.from(ATTACHMENTS_BUCKET).remove(file.versions.map((v) => v.path))
      if (storageError) console.error('file storage cleanup failed', storageError)
    }
  },

  setFileAccess: async (fileId, visibleTo) => {
    set((state) => ({ files: state.files.map((f) => (f.id === fileId ? { ...f, visibleTo } : f)) }))
    const { error } = await supabase.from('files').update({ visibleTo }).eq('id', fileId)
    if (error) console.error('setFileAccess failed', error)
  },

  addFileComment: async (fileId, authorId, text, files) => {
    const id = crypto.randomUUID()
    const attachments: Attachment[] = []
    for (const file of files ?? []) {
      const path = `file-comments/${fileId}/${id}/${safeStorageKey(file.name)}`
      const { error: uploadError } = await supabase.storage.from(ATTACHMENTS_BUCKET).upload(path, file)
      if (uploadError) {
        console.error('file comment attachment upload failed', uploadError)
        continue
      }
      attachments.push({ name: file.name, path, size: file.size, type: file.type })
    }
    const comment: FileComment = { id, fileId, authorId, text, createdAt: new Date().toISOString(), attachments }
    set((state) => ({ fileComments: [...state.fileComments, comment] }))
    const { error } = await supabase.from('file_comments').insert(comment)
    if (error) console.error('addFileComment failed', error)
  },

  deleteFileComment: async (commentId) => {
    set((state) => ({ fileComments: state.fileComments.filter((c) => c.id !== commentId) }))
    const { error } = await supabase.from('file_comments').delete().eq('id', commentId)
    if (error) console.error('deleteFileComment failed', error)
  },
}))
