import { Link } from 'react-router-dom'
import { Folder as FolderIcon } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { UploadFileDialog } from '@/components/UploadFileDialog'
import { CreateFolderDialog } from '@/components/CreateFolderDialog'
import { FileList } from '@/components/FileList'

export function FilesPage() {
  const currentUserId = useAppStore((s) => s.currentUserId)!
  const users = useAppStore((s) => s.users)
  const tasks = useAppStore((s) => s.tasks)
  const files = useAppStore((s) => s.files)
  const folders = useAppStore((s) => s.folders)
  const currentUser = users.find((u) => u.id === currentUserId)
  const isManager = currentUser?.role === 'manager'
  const teamMembers = users.filter((u) => u.id !== currentUserId)

  const rootFiles = [...files.filter((f) => !f.folderId)].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name, 'ru'))

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Файлы</h1>
          <p className="mt-1 text-sm text-muted-foreground">Общая библиотека файлов проекта</p>
        </div>
        <div className="flex items-center gap-2">
          {isManager && <CreateFolderDialog currentUserId={currentUserId} />}
          <UploadFileDialog currentUserId={currentUserId} isManager={isManager} teamMembers={teamMembers} folders={folders} />
        </div>
      </div>

      {sortedFolders.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-xs font-medium text-muted-foreground">Папки</h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {sortedFolders.map((folder) => {
              const count = files.filter((f) => f.folderId === folder.id).length
              return (
                <Link
                  key={folder.id}
                  to={`/files/f/${folder.id}`}
                  className="group flex items-center gap-3 rounded-xl bg-card px-3.5 py-3 shadow-sm shadow-black/[0.02] ring-1 ring-foreground/10 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/[0.06] dark:shadow-black/10"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <FolderIcon className="h-4.5 w-4.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{folder.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {count} {count === 1 ? 'файл' : 'файлов'}
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <h2 className="mb-2 text-xs font-medium text-muted-foreground">
        {sortedFolders.length > 0 ? 'Файлы вне папок' : 'Файлы'}
      </h2>
      <FileList
        files={rootFiles}
        users={users}
        tasks={tasks}
        folders={folders}
        currentUserId={currentUserId}
        isManager={isManager}
        emptyMessage={sortedFolders.length > 0 ? 'Вне папок файлов нет.' : 'Пока нет ни одного файла.'}
      />
    </div>
  )
}
