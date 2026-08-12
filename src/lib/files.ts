import type { FileVersion, ProjectFile } from '@/types'

export function currentVersion(file: Pick<ProjectFile, 'versions'>): FileVersion {
  return file.versions[file.versions.length - 1]
}
