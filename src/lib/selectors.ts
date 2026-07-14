import type { User } from '@/types'

export function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function userLabel(users: User[], id: string) {
  return users.find((u) => u.id === id)?.name ?? 'Неизвестный пользователь'
}
