import type { LucideIcon } from 'lucide-react'

export function EmptyState({ icon: Icon, message }: { icon?: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
      {Icon && (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
