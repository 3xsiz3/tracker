import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Folder as FolderIcon, Pencil, Trash2, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UploadFileDialog } from '@/components/UploadFileDialog'
import { FileList } from '@/components/FileList'

export function FolderDetailPage() {
  const { folderId } = useParams<{ folderId: string }>()
  const navigate = useNavigate()
  const currentUserId = useAppStore((s) => s.currentUserId)!
  const users = useAppStore((s) => s.users)
  const tasks = useAppStore((s) => s.tasks)
  const files = useAppStore((s) => s.files)
  const folders = useAppStore((s) => s.folders)
  const renameFolder = useAppStore((s) => s.renameFolder)
  const deleteFolder = useAppStore((s) => s.deleteFolder)
  const currentUser = users.find((u) => u.id === currentUserId)
  const isManager = currentUser?.role === 'manager'
  const teamMembers = users.filter((u) => u.id !== currentUserId)

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const folder = folders.find((f) => f.id === folderId)
  if (!folder) return <Navigate to="/files" replace />

  const folderFiles = [...files.filter((f) => f.folderId === folder.id)].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  function startEditing() {
    setNameDraft(folder!.name)
    setEditingName(true)
  }

  function saveName() {
    if (nameDraft.trim()) renameFolder(folder!.id, nameDraft.trim())
    setEditingName(false)
  }

  return (
    <div>
      <Link to="/files" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Назад к файлам
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <FolderIcon className="h-5 w-5" />
          </span>
          {editingName ? (
            <div className="flex items-center gap-1.5">
              <Input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName()
                  if (e.key === 'Escape') setEditingName(false)
                }}
                className="h-8 w-48"
              />
              <Button variant="ghost" size="icon-sm" onClick={saveName} aria-label="Сохранить">
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => setEditingName(false)} aria-label="Отмена">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <h1 className="flex min-w-0 items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
              <span className="truncate">{folder.name}</span>
              {isManager && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Переименовать папку"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </h1>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <UploadFileDialog
            currentUserId={currentUserId}
            isManager={isManager}
            teamMembers={teamMembers}
            folders={folders}
            defaultFolderId={folder.id}
          />
          {isManager &&
            (confirmingDelete ? (
              <span className="flex items-center gap-1">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    deleteFolder(folder.id)
                    navigate('/files')
                  }}
                >
                  Удалить папку
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setConfirmingDelete(false)}>
                  Отмена
                </Button>
              </span>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setConfirmingDelete(true)}
                aria-label="Удалить папку"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ))}
        </div>
      </div>

      <FileList
        files={folderFiles}
        users={users}
        tasks={tasks}
        folders={folders}
        currentUserId={currentUserId}
        isManager={isManager}
        emptyMessage="В этой папке пока нет файлов."
      />
    </div>
  )
}
