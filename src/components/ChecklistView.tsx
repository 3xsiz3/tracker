import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { canEditChecklist } from '@/lib/task'
import type { DevelopmentTask } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ChecklistEditor } from '@/components/ChecklistEditor'
import { Pencil } from 'lucide-react'

export function ChecklistView({ task, currentUserId }: { task: DevelopmentTask; currentUserId: string }) {
  const setChecklist = useAppStore((s) => s.setChecklist)
  const toggleChecklistItem = useAppStore((s) => s.toggleChecklistItem)
  const [editing, setEditing] = useState(false)

  const isOwner = canEditChecklist(task, currentUserId)
  const isAssignee = task.assigneeId === currentUserId
  const ownerLabel = task.checklistOwner === 'manager' ? 'руководителя' : 'сотрудника'

  if (task.checklist.length === 0 && !editing) {
    if (!isOwner) {
      return (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Ожидает разбивки задачи на условия выполнения от {ownerLabel}.
        </p>
      )
    }
    return (
      <div>
        <p className="mb-3 text-sm text-muted-foreground">
          Разбейте задачу на условия выполнения — укажите шаги и вес каждого в процентах (в сумме 100%).
        </p>
        <ChecklistEditor
          initialItems={[]}
          onSave={(items) => {
            setChecklist(task.id, items)
          }}
        />
      </div>
    )
  }

  if (editing) {
    return (
      <ChecklistEditor
        initialItems={task.checklist}
        onSave={(items) => {
          setChecklist(task.id, items)
          setEditing(false)
        }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">Условия выполнения</h3>
        {isOwner && (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="h-7 text-xs">
            <Pencil className="h-3 w-3" /> Редактировать
          </Button>
        )}
      </div>
      <ul className="space-y-1">
        {task.checklist.map((it) => (
          <li
            key={it.id}
            className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5 transition-colors has-[:checked]:bg-emerald-50 has-[:checked]:border-emerald-200 dark:has-[:checked]:bg-emerald-950/30 dark:has-[:checked]:border-emerald-900"
          >
            <Checkbox
              checked={it.done}
              disabled={!isAssignee}
              onCheckedChange={() => toggleChecklistItem(task.id, it.id)}
            />
            <span className={`flex-1 text-sm ${it.done ? 'text-muted-foreground line-through' : ''}`}>{it.label}</span>
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {it.weight}%
            </span>
          </li>
        ))}
      </ul>
      {!isAssignee && (
        <p className="mt-2 text-xs text-muted-foreground">Отмечать выполнение может только сотрудник, которому назначена задача.</p>
      )}
    </div>
  )
}
