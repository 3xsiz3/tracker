import { useState } from 'react'
import JSZip from 'jszip'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Download, FileText, FolderInput, History, Lock, Package, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/EmptyState'
import { attachmentSignedUrl } from '@/lib/supabase'
import { formatFileSize } from '@/lib/utils'
import { currentVersion, uniqueFileName, NO_FOLDER } from '@/lib/files'
import { userLabel } from '@/lib/selectors'
import type { DevelopmentTask, Folder, ProjectFile, User } from '@/types'

export function FileList({
  files,
  users,
  tasks,
  folders,
  currentUserId,
  isManager,
  emptyMessage,
}: {
  files: ProjectFile[]
  users: User[]
  tasks: DevelopmentTask[]
  folders: Folder[]
  currentUserId: string
  isManager: boolean
  emptyMessage: string
}) {
  const moveFileToFolder = useAppStore((s) => s.moveFileToFolder)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [zipping, setZipping] = useState(false)

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleDownload(file: ProjectFile) {
    setDownloadingId(file.id)
    try {
      const version = currentVersion(file)
      const url = await attachmentSignedUrl(version.path, version.fileName)
      window.open(url, '_blank')
    } catch (error) {
      console.error('file download failed', error)
    } finally {
      setDownloadingId(null)
    }
  }

  async function handleBulkDownload() {
    const selectedFiles = files.filter((f) => selected.has(f.id))
    if (selectedFiles.length === 0) return
    if (selectedFiles.length === 1) {
      await handleDownload(selectedFiles[0])
      return
    }
    setZipping(true)
    try {
      const zip = new JSZip()
      const usedNames = new Set<string>()
      for (const file of selectedFiles) {
        const version = currentVersion(file)
        const url = await attachmentSignedUrl(version.path)
        const res = await fetch(url)
        const blob = await res.blob()
        const name = uniqueFileName(version.fileName, usedNames)
        usedNames.add(name)
        zip.file(name, blob)
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `файлы_${format(new Date(), 'yyyy-MM-dd_HHmm')}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setSelected(new Set())
    } catch (error) {
      console.error('bulk download failed', error)
    } finally {
      setZipping(false)
    }
  }

  if (files.length === 0) {
    return <EmptyState icon={FileText} message={emptyMessage} />
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-primary/5 px-3 py-2 ring-1 ring-primary/20">
          <span className="text-sm font-medium">Выбрано: {selected.size}</span>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleBulkDownload} disabled={zipping}>
              <Package className="h-3.5 w-3.5" /> {zipping ? 'Готовим архив...' : 'Скачать'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              <X className="h-3.5 w-3.5" /> Отменить
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {files.map((file) => {
          const version = currentVersion(file)
          const task = file.taskId ? tasks.find((t) => t.id === file.taskId) : undefined
          const canManage = isManager || file.uploadedById === currentUserId
          return (
            <Card key={file.id} className="transition-colors duration-150 hover:bg-accent/40">
              <CardContent className="flex flex-wrap items-center gap-3 py-3">
                <Checkbox
                  checked={selected.has(file.id)}
                  onCheckedChange={() => toggleSelected(file.id)}
                  aria-label={`Выбрать ${file.name}`}
                  className="shrink-0"
                />
                <Link to={`/files/${file.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 truncate text-sm font-medium">{file.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatFileSize(version.size)}</span>
                    {file.versions.length > 1 && (
                      <span className="flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
                        <History className="h-3 w-3" /> v{file.versions.length}
                      </span>
                    )}
                    {file.visibleTo.length > 0 && <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />}
                  </div>
                  {file.note && <p className="mt-1 truncate text-sm text-muted-foreground">{file.note}</p>}
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {userLabel(users, file.uploadedById)} · {format(new Date(version.createdAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                    {task && <> · {task.title}</>}
                  </p>
                </Link>
                <div className="flex shrink-0 items-center gap-1.5">
                  {canManage && (
                    <Select
                      value={file.folderId ?? NO_FOLDER}
                      onValueChange={(v) => moveFileToFolder(file.id, v === NO_FOLDER ? undefined : v)}
                    >
                      <SelectTrigger size="sm" className="max-w-[9rem]" aria-label="Переместить в папку">
                        <FolderInput className="h-3.5 w-3.5 text-muted-foreground" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_FOLDER}>Без папки</SelectItem>
                        {folders.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleDownload(file)} disabled={downloadingId === file.id}>
                    <Download className="h-3.5 w-3.5" /> Скачать
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
