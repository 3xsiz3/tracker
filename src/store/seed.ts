import type { Comment, DevelopmentTask, User } from '@/types'

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString()
const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString()

export const seedUsers: User[] = [
  { id: 'm1', name: 'Анна Соколова', role: 'manager', avatarColor: 'bg-violet-500' },
  { id: 'm2', name: 'Сергей Иванов', role: 'manager', avatarColor: 'bg-blue-500' },
  { id: 'e1', name: 'Артем Фатеев', role: 'employee', managerId: 'm1', avatarColor: 'bg-emerald-500' },
  { id: 'e2', name: 'Мария Кузнецова', role: 'employee', managerId: 'm1', avatarColor: 'bg-amber-500' },
  { id: 'e3', name: 'Дмитрий Волков', role: 'employee', managerId: 'm1', avatarColor: 'bg-rose-500' },
  { id: 'e4', name: 'Ольга Смирнова', role: 'employee', managerId: 'm2', avatarColor: 'bg-cyan-500' },
  { id: 'e5', name: 'Павел Новиков', role: 'employee', managerId: 'm2', avatarColor: 'bg-fuchsia-500' },
]

let checklistId = 0
const item = (label: string, weight: number, done: boolean) => ({
  id: `ci${++checklistId}`,
  label,
  weight,
  done,
})

export const seedTasks: DevelopmentTask[] = [
  {
    id: 't1',
    title: 'Публичные выступления',
    description: 'Подготовить и провести презентацию на 15 минут перед командой.',
    competency: 'Коммуникация',
    assigneeId: 'e1',
    createdById: 'm1',
    checklistOwner: 'manager',
    checklist: [
      item('Изучить теорию публичных выступлений', 20, true),
      item('Подготовить слайды презентации', 40, true),
      item('Провести презентацию перед командой', 40, false),
    ],
    dueDate: daysFromNow(10),
    createdAt: daysAgo(14),
    history: [
      { at: daysAgo(14), status: 'not_started', progress: 0 },
      { at: daysAgo(7), status: 'in_progress', progress: 20 },
      { at: daysAgo(2), status: 'in_progress', progress: 60 },
    ],
  },
  {
    id: 't2',
    title: 'Основы тайм-менеджмента',
    description: 'Пройти курс и внедрить технику Pomodoro в ежедневную работу на 2 недели.',
    competency: 'Самоорганизация',
    assigneeId: 'e1',
    createdById: 'm1',
    checklistOwner: 'employee',
    checklist: [],
    dueDate: daysFromNow(21),
    createdAt: daysAgo(3),
    history: [{ at: daysAgo(3), status: 'not_started', progress: 0 }],
  },
  {
    id: 't3',
    title: 'Работа с возражениями клиентов',
    description: 'Изучить 5 сценариев работы с возражениями и отработать их в ролевой игре.',
    competency: 'Продажи',
    assigneeId: 'e2',
    createdById: 'm1',
    checklistOwner: 'manager',
    checklist: [
      item('Изучить 5 сценариев работы с возражениями', 40, true),
      item('Провести ролевую игру с руководителем', 30, true),
      item('Применить приёмы на реальном звонке', 30, true),
    ],
    dueDate: daysAgo(1),
    createdAt: daysAgo(30),
    history: [
      { at: daysAgo(30), status: 'not_started', progress: 0 },
      { at: daysAgo(20), status: 'in_progress', progress: 40 },
      { at: daysAgo(5), status: 'completed', progress: 100 },
    ],
  },
  {
    id: 't4',
    title: 'Наставничество для новых сотрудников',
    description: 'Взять на менторство одного нового сотрудника и провести с ним 3 встречи.',
    competency: 'Лидерство',
    assigneeId: 'e3',
    createdById: 'm1',
    checklistOwner: 'manager',
    checklist: [
      item('Составить план встреч', 25, true),
      item('Провести встречу 1', 25, false),
      item('Провести встречу 2', 25, false),
      item('Провести встречу 3 и подвести итоги', 25, false),
    ],
    dueDate: daysFromNow(30),
    createdAt: daysAgo(10),
    history: [
      { at: daysAgo(10), status: 'not_started', progress: 0 },
      { at: daysAgo(4), status: 'in_progress', progress: 25 },
    ],
  },
  {
    id: 't5',
    title: 'Основы SQL',
    description: 'Пройти вводный курс по SQL и выполнить 10 практических заданий.',
    competency: 'Аналитика',
    assigneeId: 'e4',
    createdById: 'm2',
    checklistOwner: 'employee',
    checklist: [
      item('Пройти вводный курс по SQL', 45, true),
      item('Выполнить 10 практических заданий', 55, false),
    ],
    dueDate: daysFromNow(15),
    createdAt: daysAgo(8),
    history: [
      { at: daysAgo(8), status: 'not_started', progress: 0 },
      { at: daysAgo(2), status: 'in_progress', progress: 45 },
    ],
  },
  {
    id: 't6',
    title: 'Английский для переговоров',
    description: 'Провести 4 занятия с преподавателем на тему деловых переговоров.',
    competency: 'Язык',
    assigneeId: 'e5',
    createdById: 'm2',
    checklistOwner: 'manager',
    checklist: [
      item('Провести занятие 1', 25, false),
      item('Провести занятие 2', 25, false),
      item('Провести занятие 3', 25, false),
      item('Провести занятие 4', 25, false),
    ],
    dueDate: daysFromNow(40),
    createdAt: daysAgo(1),
    history: [{ at: daysAgo(1), status: 'not_started', progress: 0 }],
  },
  {
    id: 't7',
    title: 'Изучить JavaScript',
    description: 'Освоить базовый синтаксис JavaScript и написать первую практическую задачу.',
    competency: 'Программирование',
    assigneeId: 'e1',
    createdById: 'm1',
    checklistOwner: 'manager',
    checklist: [
      item('Посмотреть вводное видео по JS', 20, true),
      item('Изучить синтаксис языка', 30, true),
      item('Написать простенькую задачу', 40, false),
      item('Пройти тест', 10, false),
    ],
    dueDate: daysFromNow(18),
    createdAt: daysAgo(6),
    history: [
      { at: daysAgo(6), status: 'not_started', progress: 0 },
      { at: daysAgo(2), status: 'in_progress', progress: 50 },
    ],
  },
]

export const seedComments: Comment[] = [
  {
    id: 'c1',
    taskId: 't1',
    authorId: 'm1',
    text: 'Отличный прогресс! Не забудь добавить примеры из реальных кейсов.',
    createdAt: daysAgo(6),
  },
  {
    id: 'c2',
    taskId: 't1',
    authorId: 'e1',
    text: 'Спасибо, уже готовлю слайды с кейсами.',
    createdAt: daysAgo(5),
  },
  {
    id: 'c3',
    taskId: 't3',
    authorId: 'm1',
    text: 'Отличная работа на ролевой игре, видно уверенность в диалогах.',
    createdAt: daysAgo(4),
  },
]
