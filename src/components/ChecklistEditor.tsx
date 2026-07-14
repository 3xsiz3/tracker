import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { ChecklistItem } from '@/types'
import { checklistWeightSum } from '@/lib/task'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

let draftIdSeq = 0
const nextDraftId = () => `draft-${Date.now()}-${++draftIdSeq}`

export function ChecklistEditor({
  initialItems,
  onSave,
  onCancel,
}: {
  initialItems: ChecklistItem[]
  onSave: (items: ChecklistItem[]) => void
  onCancel?: () => void
}) {
  const [items, setItems] = useState<ChecklistItem[]>(
    initialItems.length > 0 ? initialItems : [{ id: nextDraftId(), label: '', weight: 0, done: false }],
  )

  const total = checklistWeightSum(items)
  const remaining = 100 - total
  const allLabeled = items.every((it) => it.label.trim().length > 0)
  const canSave = items.length > 0 && total === 100 && allLabeled

  function updateItem(id: string, patch: Partial<ChecklistItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  function addRow() {
    setItems((prev) => [...prev, { id: nextDraftId(), label: '', weight: Math.max(remaining, 0), done: false }])
  }

  function removeRow(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2">
            <Input
              value={it.label}
              onChange={(e) => updateItem(it.id, { label: e.target.value })}
              placeholder="Условие выполнения, например: посмотреть видео"
              className="flex-1"
            />
            <div className="relative w-24 shrink-0">
              <Input
                type="number"
                min={0}
                max={100}
                value={it.weight}
                onChange={(e) => updateItem(it.id, { weight: Number(e.target.value) || 0 })}
                className="pr-6 text-right"
              />
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">
                %
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeRow(it.id)}
              disabled={items.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-3.5 w-3.5" /> Добавить условие
        </Button>
        <span className={`text-xs font-medium ${total === 100 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
          Сумма: {total}% {remaining !== 0 && `(осталось ${remaining}%)`}
        </span>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" size="sm" disabled={!canSave} onClick={() => onSave(items)}>
          Сохранить условия
        </Button>
        {onCancel && (
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
      </div>
    </div>
  )
}
