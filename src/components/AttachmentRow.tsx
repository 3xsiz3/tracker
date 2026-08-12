import { useState } from 'react'
import { Download } from 'lucide-react'
import { attachmentSignedUrl } from '@/lib/supabase'
import { formatFileSize } from '@/lib/utils'
import type { Attachment } from '@/types'

export function AttachmentRow({ attachment }: { attachment: Attachment }) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      const url = await attachmentSignedUrl(attachment.path)
      window.open(url, '_blank')
    } catch (error) {
      console.error('attachment download failed', error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
    >
      <Download className="h-3 w-3 shrink-0" />
      <span className="max-w-[12rem] truncate">{attachment.name}</span>
      <span className="shrink-0 text-muted-foreground">{formatFileSize(attachment.size)}</span>
    </button>
  )
}
