import { useState } from 'react'
import { UploadCloud } from 'lucide-react'
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
import { formatFileSize } from '@/lib/utils'

export function AddFileVersionDialog({ fileId, currentUserId }: { fileId: string; currentUserId: string }) {
  const addFileVersion = useAppStore((s) => s.addFileVersion)
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleSubmit() {
    if (!file) return
    setUploading(true)
    try {
      await addFileVersion(fileId, file, currentUserId)
      setFile(null)
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
        if (!next) setFile(null)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UploadCloud className="h-3.5 w-3.5" /> Новая версия
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Загрузить новую версию</DialogTitle>
          <DialogDescription>Старые версии останутся доступны в истории версий.</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm file:mr-2 file:rounded-md file:border file:bg-background file:px-2 file:py-1 file:text-xs"
          />
          {file && (
            <p className="mt-2 text-xs text-muted-foreground">
              {file.name} · {formatFileSize(file.size)}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={!file || uploading}>
            Загрузить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
