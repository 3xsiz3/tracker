import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

// Supabase Storage отклоняет ключи объектов с кириллицей и другими не-ASCII символами
// (StorageApiError: Invalid key). Оригинальное имя всё равно хранится отдельно и
// показывается пользователю — здесь нужен только безопасный для хранилища ключ.
export function safeStorageKey(name: string) {
  const dot = name.lastIndexOf('.')
  const ext = dot > 0 ? name.slice(dot).replace(/[^A-Za-z0-9.]+/g, '') : ''
  const base = dot > 0 ? name.slice(0, dot) : name
  const safeBase = base.replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 100) || 'file'
  return `${safeBase}${ext}`
}
