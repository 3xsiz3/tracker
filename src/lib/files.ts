import type { FileVersion, ProjectFile } from '@/types'

export const NO_FOLDER = '__root__'

export function currentVersion(file: Pick<ProjectFile, 'versions'>): FileVersion {
  return file.versions[file.versions.length - 1]
}

export function uniqueFileName(name: string, used: Set<string>): string {
  if (!used.has(name)) return name
  const dot = name.lastIndexOf('.')
  const stem = dot > 0 ? name.slice(0, dot) : name
  const ext = dot > 0 ? name.slice(dot) : ''
  let i = 2
  let candidate = `${stem} (${i})${ext}`
  while (used.has(candidate)) {
    i += 1
    candidate = `${stem} (${i})${ext}`
  }
  return candidate
}
