import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

export const ATTACHMENTS_BUCKET = 'attachments'

// download: имя файла заставляет браузер скачать файл (Content-Disposition: attachment)
// вместо того чтобы попытаться открыть его inline (актуально для .json, .txt и т.п.).
export async function attachmentSignedUrl(path: string, downloadName?: string) {
  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(path, 60, downloadName ? { download: downloadName } : undefined)
  if (error) throw error
  return data.signedUrl
}
