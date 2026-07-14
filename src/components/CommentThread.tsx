import { useState } from 'react'
import { format } from 'date-fns'
import { useAppStore } from '@/store/useAppStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { initials } from '@/lib/selectors'

export function CommentThread({ taskId, currentUserId }: { taskId: string; currentUserId: string }) {
  const allComments = useAppStore((s) => s.comments)
  const comments = allComments.filter((c) => c.taskId === taskId)
  const users = useAppStore((s) => s.users)
  const addComment = useAppStore((s) => s.addComment)
  const [text, setText] = useState('')

  const sorted = [...comments].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  function handleSubmit() {
    if (!text.trim()) return
    addComment(taskId, currentUserId, text.trim())
    setText('')
  }

  return (
    <div className="space-y-4">
      {sorted.length === 0 && <p className="text-sm text-muted-foreground">Комментариев пока нет.</p>}
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
                <span className="text-xs text-muted-foreground">{format(new Date(comment.createdAt), 'd MMM, HH:mm')}</span>
              </div>
              <p className="mt-1 text-sm">{comment.text}</p>
            </div>
          </div>
        )
      })}

      <div className="flex gap-2 pt-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Написать комментарий..."
          rows={2}
          className="resize-none"
        />
        <Button onClick={handleSubmit} disabled={!text.trim()} className="self-end">
          Отправить
        </Button>
      </div>
    </div>
  )
}
