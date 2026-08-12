import { useRef, useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Paperclip, Trash2, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AttachmentRow } from '@/components/AttachmentRow'
import { initials } from '@/lib/selectors'
import { formatFileSize } from '@/lib/utils'

export function FileCommentThread({ fileId, currentUserId }: { fileId: string; currentUserId: string }) {
  const allComments = useAppStore((s) => s.fileComments)
  const comments = allComments.filter((c) => c.fileId === fileId)
  const users = useAppStore((s) => s.users)
  const addFileComment = useAppStore((s) => s.addFileComment)
  const deleteFileComment = useAppStore((s) => s.deleteFileComment)
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sorted = [...comments].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  function handlePickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    setFiles((prev) => [...prev, ...picked])
    e.target.value = ''
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (!text.trim() && files.length === 0) return
    setSending(true)
    try {
      await addFileComment(fileId, currentUserId, text.trim(), files.length > 0 ? files : undefined)
      setText('')
      setFiles([])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      {sorted.length === 0 && <p className="text-sm text-muted-foreground">Пока нет обсуждения.</p>}
      {sorted.map((comment) => {
        const author = users.find((u) => u.id === comment.authorId)
        return (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className={`${author?.avatarColor ?? 'bg-gray-400'} text-white text-xs`}>
                {initials(author?.name ?? '?')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 rounded-lg bg-muted px-3 py-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium">{author?.name ?? 'Неизвестный'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{format(new Date(comment.createdAt), 'd MMM, HH:mm', { locale: ru })}</span>
                  {comment.authorId === currentUserId && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(comment.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Удалить комментарий"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {comment.text && <p className="mt-1 text-sm">{comment.text}</p>}
              {comment.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {comment.attachments.map((a) => (
                    <AttachmentRow key={a.path} attachment={a} />
                  ))}
                </div>
              )}
              {confirmDeleteId === comment.id && (
                <div className="mt-2 flex items-center gap-2 rounded-md bg-background/60 px-2 py-1.5 text-xs">
                  <span>Удалить комментарий?</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => {
                      deleteFileComment(comment.id)
                      setConfirmDeleteId(null)
                    }}
                  >
                    Да, удалить
                  </Button>
                  <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => setConfirmDeleteId(null)}>
                    Отмена
                  </Button>
                </div>
              )}
            </div>
          </div>
        )
      })}

      <div className="flex flex-col gap-2 pt-2">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {files.map((file, i) => (
              <span key={i} className="flex items-center gap-1.5 rounded-md border bg-muted px-2 py-1 text-xs">
                <span className="max-w-[12rem] truncate">{file.name}</span>
                <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Написать комментарий..."
            rows={2}
            className="resize-none"
          />
          <div className="flex items-center gap-2 self-end">
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handlePickFiles} />
            <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} aria-label="Прикрепить файл">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button onClick={handleSubmit} disabled={sending || (!text.trim() && files.length === 0)}>
              Отправить
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
