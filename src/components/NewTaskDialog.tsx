import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { ChecklistItem, ChecklistOwner } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChecklistEditor } from '@/components/ChecklistEditor'
import { Pencil } from 'lucide-react'

export function NewTaskDialog({ assigneeId, createdById }: { assigneeId: string; createdById: string }) {
  const createTask = useAppStore((s) => s.createTask)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [competency, setCompetency] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [checklistOwner, setChecklistOwner] = useState<ChecklistOwner>('manager')
  const [checklist, setChecklistState] = useState<ChecklistItem[] | null>(null)

  function reset() {
    setTitle('')
    setCompetency('')
    setDescription('')
    setDueDate('')
    setChecklistOwner('manager')
    setChecklistState(null)
  }

  const readyToCreate = title.trim().length > 0 && (checklistOwner === 'employee' || checklist !== null)

  function handleSubmit() {
    if (!readyToCreate) return
    createTask({
      title: title.trim(),
      description: description.trim(),
      competency: competency.trim() || 'Общее развитие',
      assigneeId,
      createdById,
      checklistOwner,
      checklist: checklistOwner === 'manager' ? checklist ?? [] : [],
      dueDate: dueDate || undefined,
    })
    reset()
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">Новая задача</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Новая задача развития</DialogTitle>
          <DialogDescription>Опишите, какой навык или компетенцию нужно развить.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="title">Название</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Публичные выступления" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="competency">Компетенция</Label>
            <Input id="competency" value={competency} onChange={(e) => setCompetency(e.target.value)} placeholder="Например: Коммуникация" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Что нужно сделать для выполнения задачи?"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dueDate">Срок (необязательно)</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div className="grid gap-2 border-t pt-4">
            <Label>Кто разобьёт задачу на условия выполнения?</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setChecklistOwner('manager')
                  setChecklistState(null)
                }}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  checklistOwner === 'manager' ? 'border-primary bg-primary/5 font-medium' : 'hover:bg-accent'
                }`}
              >
                Я разобью сам
              </button>
              <button
                type="button"
                onClick={() => {
                  setChecklistOwner('employee')
                  setChecklistState(null)
                }}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  checklistOwner === 'employee' ? 'border-primary bg-primary/5 font-medium' : 'hover:bg-accent'
                }`}
              >
                Пусть сотрудник разобьёт
              </button>
            </div>

            {checklistOwner === 'manager' &&
              (checklist === null ? (
                <div className="pt-2">
                  <ChecklistEditor initialItems={[]} onSave={setChecklistState} />
                </div>
              ) : (
                <div className="mt-2 space-y-1 rounded-lg border p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Условия выполнения</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setChecklistState(null)}>
                      <Pencil className="h-3 w-3" /> Изменить
                    </Button>
                  </div>
                  {checklist.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-sm">
                      <span>{it.label}</span>
                      <span className="text-xs text-muted-foreground">{it.weight}%</span>
                    </div>
                  ))}
                </div>
              ))}
            {checklistOwner === 'employee' && (
              <p className="text-xs text-muted-foreground">
                Сотрудник сам разобьёт задачу на условия выполнения после получения.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={!readyToCreate}>
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
