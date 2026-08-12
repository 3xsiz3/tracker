import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

export const ATTACHMENTS_BUCKET = 'attachments'

export async function attachmentSignedUrl(path: string) {
  const { data, error } = await supabase.storage.from(ATTACHMENTS_BUCKET).createSignedUrl(path, 60)
  if (error) throw error
  return data.signedUrl
}
