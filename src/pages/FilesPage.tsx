import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Download, FileText, History, Lock } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { UploadFileDialog } from '@/components/UploadFileDialog'
import { attachmentSignedUrl } from '@/lib/supabase'
import { formatFileSize } from '@/lib/utils'
import { currentVersion } from '@/lib/files'
import { userLabel } from '@/lib/selectors'
import type { ProjectFile } from '@/types'

export function FilesPage() {
  const currentUserId = useAppStore((s) => s.currentUserId)!
  const users = useAppStore((s) => s.users)
  const tasks = useAppStore((s) => s.tasks)
  const files = useAppStore((s) => s.files)
  const currentUser = users.find((u) => u.id === currentUserId)
  const isManager = currentUser?.role === 'manager'
  const teamMembers = users.filter((u) => u.id !== currentUserId)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const sorted = [...files].sort((a, b) => {
    const aLatest = currentVersion(a).createdAt
    const bLatest = currentVersion(b).createdAt
    return bLatest.localeCompare(aLatest)
  })

  async function handleDownload(file: ProjectFile) {
    setDownloadingId(file.id)
    try {
      const url = await attachmentSignedUrl(currentVersion(file).path)
      window.open(url, '_blank')
    } catch (error) {
      console.error('file download failed', error)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Файлы</h1>
          <p className="mt-1 text-sm text-muted-foreground">Общая библиотека файлов проекта</p>
        </div>
        <UploadFileDialog currentUserId={currentUserId} isManager={isManager} teamMembers={teamMembers} />
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={FileText} message="Пока нет ни одного файла." />
      ) : (
        <div className="space-y-2">
          {sorted.map((file) => {
            const version = currentVersion(file)
            const task = file.taskId ? tasks.find((t) => t.id === file.taskId) : undefined
            return (
              <Card key={file.id} className="transition-colors duration-150 hover:bg-accent/40">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      disabled={downloadingId === file.id}
                    >
                      <Download className="h-3.5 w-3.5" /> Скачать
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
