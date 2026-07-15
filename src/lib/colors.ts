import type { TaskStatus } from '@/types'

const COMPETENCY_PALETTE = [
  { border: 'border-l-violet-500', text: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-500/10' },
  { border: 'border-l-blue-500', text: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-500/10' },
  { border: 'border-l-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  { border: 'border-l-amber-500', text: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-500/10' },
  { border: 'border-l-rose-500', text: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-500/10' },
  { border: 'border-l-cyan-500', text: 'text-cyan-700 dark:text-cyan-400', bg: 'bg-cyan-500/10' },
]

export function competencyStyle(competency: string) {
  let hash = 0
  for (let i = 0; i < competency.length; i++) hash = (hash * 31 + competency.charCodeAt(i)) >>> 0
  return COMPETENCY_PALETTE[hash % COMPETENCY_PALETTE.length]
}

export const STATUS_PILL: Record<TaskStatus, { className: string }> = {
  not_started: { className: 'bg-muted text-muted-foreground' },
  in_progress: { className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  pending_review: { className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
  completed: { className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
}

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-fuchsia-500',
  'bg-indigo-500',
]

export function avatarColorForIndex(i: number) {
  return AVATAR_COLORS[i % AVATAR_COLORS.length]
}
