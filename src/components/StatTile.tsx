import type { LucideIcon } from 'lucide-react'

export function StatTile({
  icon: Icon,
  label,
  value,
  accent = 'text-violet-600 bg-violet-500/10',
}: {
  icon: LucideIcon
  label: string
  value: string | number
  accent?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-4 text-card-foreground shadow-sm shadow-black/[0.02] ring-1 ring-foreground/10 dark:shadow-black/10">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-semibold leading-none tracking-tight tabular-nums">{value}</p>
        <p className="mt-1.5 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
