import { useState } from 'react'
import { Upload } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { User } from '@/types'
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { formatFileSize } from '@/lib/utils'

export function UploadFileDialog({
  currentUserId,
  isManager,
  teamMembers,
}: {
  currentUserId: string
  isManager: boolean
  teamMembers: User[]
}) {
  const uploadFile = useAppStore((s) => s.uploadFile)
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [note, setNote] = useState('')
  const [restricted, setRestricted] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  function reset() {
    setFiles([])
    setNote('')
    setRestricted(false)
    setSelected([])
  }

  function toggleSelected(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleSubmit() {
    if (files.length === 0) return
    setUploading(true)
    try {
      const visibleTo = restricted ? selected : []
      for (const file of files) {
        await uploadFile({ file, uploadedById: currentUserId, note: note.trim(), visibleTo })
      }
      reset()
      setOpen(false)
    } finally {
      setUploading(false)
    }
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
        <Button size="sm">
          <Upload className="h-4 w-4" /> Загрузить файл
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Загрузка файла</DialogTitle>
          <DialogDescription>Файл появится в общей библиотеке файлов проекта.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="file-note">Что это за файл(ы)?</Label>
            <Textarea
              id="file-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Например: шаблон отчёта за март"
              rows={2}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file-input">Файлы</Label>
            <input
              id="file-input"
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="text-sm file:mr-2 file:rounded-md file:border file:bg-background file:px-2 file:py-1 file:text-xs"
            />
            {files.length > 0 && (
              <ul className="space-y-0.5 text-xs text-muted-foreground">
                {files.map((f, i) => (
                  <li key={i}>
                    {f.name} · {formatFileSize(f.size)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isManager && (
            <div className="grid gap-2 border-t pt-4">
              <Label>Кому видно</Label>
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
                    <label key={u.id} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={selected.includes(u.id)} onCheckedChange={() => toggleSelected(u.id)} />
                      {u.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={files.length === 0 || uploading}>
            Загрузить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
