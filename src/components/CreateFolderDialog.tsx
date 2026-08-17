import { useState } from 'react'
import { FolderPlus } from 'lucide-react'
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

export function CreateFolderDialog({ currentUserId }: { currentUserId: string }) {
  const createFolder = useAppStore((s) => s.createFolder)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  function handleSubmit() {
    if (!name.trim()) return
    createFolder(name.trim(), currentUserId)
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
          <FolderPlus className="h-4 w-4" /> Новая папка
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Новая папка</DialogTitle>
          <DialogDescription>Поможет сгруппировать файлы вместо одного большого списка.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor="folder-name">Название</Label>
          <Input
            id="folder-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Отчёты"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
