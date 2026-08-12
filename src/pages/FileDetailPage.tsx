import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ArrowLeft, Download, FileText, History, Lock, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AddFileVersionDialog } from '@/components/AddFileVersionDialog'
import { FileAccessDialog } from '@/components/FileAccessDialog'
import { FileCommentThread } from '@/components/FileCommentThread'
import { attachmentSignedUrl } from '@/lib/supabase'
import { formatFileSize } from '@/lib/utils'
import { currentVersion } from '@/lib/files'
import { userLabel } from '@/lib/selectors'

export function FileDetailPage() {
  const { fileId } = useParams<{ fileId: string }>()
  const navigate = useNavigate()
  const currentUserId = useAppStore((s) => s.currentUserId)!
  const users = useAppStore((s) => s.users)
  const tasks = useAppStore((s) => s.tasks)
  const file = useAppStore((s) => s.files.find((f) => f.id === fileId))
  const deleteFile = useAppStore((s) => s.deleteFile)
  const currentUser = users.find((u) => u.id === currentUserId)
  const isManager = currentUser?.role === 'manager'
  const teamMembers = users.filter((u) => u.id !== currentUserId)
  const [downloadingPath, setDownloadingPath] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!file) return deleting ? null : <Navigate to="/files" replace />

  const canManage = isManager || file.uploadedById === currentUserId
  const version = currentVersion(file)
  const task = file.taskId ? tasks.find((t) => t.id === file.taskId) : undefined
  const olderVersions = [...file.versions].slice(0, -1).reverse()

  async function handleDownload(path: string) {
    setDownloadingPath(path)
    try {
      const url = await attachmentSignedUrl(path)
      window.open(url, '_blank')
    } catch (error) {
      console.error('file download failed', error)
    } finally {
      setDownloadingPath(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/files" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Назад к файлам
      </Link>

      <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
        <h1 className="flex min-w-0 items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
          <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span className="truncate">{file.name}</span>
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          {file.visibleTo.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" /> Ограничен доступ
            </Badge>
          )}
          {canManage &&
            (confirmingDelete ? (
              <span className="flex items-center gap-1">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setDeleting(true)
                    deleteFile(file.id)
                    navigate('/files')
                  }}
                >
                  Да, удалить
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setConfirmingDelete(false)}>
                  Отмена
                </Button>
              </span>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => setConfirmingDelete(true)}
                aria-label="Удалить файл"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ))}
        </div>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Добавил: {userLabel(users, file.uploadedById)} · {format(new Date(file.createdAt), 'd MMM yyyy, HH:mm', { locale: ru })}
        {task && (
          <>
            {' '}
            ·{' '}
            <Link to={`/tasks/${task.id}`} className="underline hover:text-foreground">
              {task.title}
            </Link>
          </>
        )}
      </p>

      {file.note && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <p className="text-sm">{file.note}</p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent className="space-y-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{version.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(version.size)} · загрузил {userLabel(users, version.uploadedById)} ·{' '}
                {format(new Date(version.createdAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                {file.versions.length > 1 && ` · версия ${file.versions.length}`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(version.path)}
                disabled={downloadingPath === version.path}
              >
                <Download className="h-3.5 w-3.5" /> Скачать
              </Button>
              {isManager && <FileAccessDialog file={file} teamMembers={teamMembers} />}
              {canManage && <AddFileVersionDialog fileId={file.id} currentUserId={currentUserId} />}
            </div>
          </div>

          {olderVersions.length > 0 && (
            <div className="border-t pt-3">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <History className="h-3.5 w-3.5" /> Предыдущие версии
              </h3>
              <ul className="space-y-1.5">
                {olderVersions.map((v, i) => (
                  <li key={i} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-xs">
                    <span className="min-w-0 truncate text-muted-foreground">
                      {v.fileName} · {formatFileSize(v.size)} · {userLabel(users, v.uploadedById)} ·{' '}
                      {format(new Date(v.createdAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 shrink-0 text-xs"
                      onClick={() => handleDownload(v.path)}
                      disabled={downloadingPath === v.path}
                    >
                      <Download className="h-3 w-3" /> Скачать
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-medium">Обсуждение</h2>
        <FileCommentThread fileId={file.id} currentUserId={currentUserId} />
      </div>
    </div>
  )
}
