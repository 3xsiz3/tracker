import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
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

export function AddEmployeeDialog({ managerId }: { managerId: string }) {
  const addEmployee = useAppStore((s) => s.addEmployee)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  function handleSubmit() {
    if (!name.trim()) return
    addEmployee({ name: name.trim(), managerId })
    setName('')
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setName('')
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4" /> Добавить сотрудника
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Новый сотрудник</DialogTitle>
          <DialogDescription>Добавьте сотрудника в свою команду.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor="employee-name">Имя</Label>
          <Input
            id="employee-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Иван Петров"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
