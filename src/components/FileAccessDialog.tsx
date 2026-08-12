import { useState } from 'react'
import { Lock } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { ProjectFile, User } from '@/types'
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
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export function FileAccessDialog({ file, teamMembers }: { file: ProjectFile; teamMembers: User[] }) {
  const setFileAccess = useAppStore((s) => s.setFileAccess)
  const [open, setOpen] = useState(false)
  const [restricted, setRestricted] = useState(file.visibleTo.length > 0)
  const [selected, setSelected] = useState<string[]>(file.visibleTo)

  function toggleSelected(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function handleSave() {
    setFileAccess(file.id, restricted ? selected : [])
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setRestricted(file.visibleTo.length > 0)
          setSelected(file.visibleTo)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Lock className="h-3.5 w-3.5" /> Доступ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Доступ к файлу</DialogTitle>
          <DialogDescription className="truncate">{file.name}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRestricted(false)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                !restricted ? 'border-primary bg-primary/5 font-medium' : 'hover:bg-accent'
              }`}
            >
              Всем сотрудникам
            </button>
            <button
              type="button"
              onClick={() => setRestricted(true)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                restricted ? 'border-primary bg-primary/5 font-medium' : 'hover:bg-accent'
              }`}
            >
              Только выбранным
            </button>
          </div>
          {restricted && (
            <div className="space-y-1.5 rounded-lg border p-2">
              {teamMembers.length === 0 && <p className="text-xs text-muted-foreground">Нет других пользователей.</p>}
              {teamMembers.map((u) => (
                <Label key={u.id} className="flex items-center gap-2 text-sm font-normal">
                  <Checkbox checked={selected.includes(u.id)} onCheckedChange={() => toggleSelected(u.id)} />
                  {u.name}
                </Label>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
