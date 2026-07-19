import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const base = 'http://localhost:5173'
const shots = 'tests/screenshots'
mkdirSync(shots, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } })
const page = await context.newPage()

const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push('console: ' + msg.text())
})
page.on('pageerror', (err) => errors.push('page: ' + err.message))

let failed = 0
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) failed++
}

async function shot(name) {
  await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true })
}

async function switchUser(name) {
  await page.getByText('Сменить пользователя').click()
  await page.waitForURL('**/login')
  await page.getByText(name).click()
  await page.waitForTimeout(200)
}

// ---------- 1. Login page ----------
await page.goto(base)
await page.waitForSelector('text=Выберите пользователя')
check('login: managers section', await page.getByText('Руководители').isVisible())
check('login: employees section', await page.getByText('Сотрудники', { exact: true }).isVisible())
await shot('f01-login')

// ---------- 2. Manager: add employee, create task with questions ----------
await page.getByText('Анна Соколова').click()
await page.waitForURL('**/manager')

await page.getByRole('button', { name: 'Добавить сотрудника' }).click()
await page.getByLabel('Имя').fill('Игорь Тестов')
await page.getByRole('button', { name: 'Добавить', exact: true }).click()
await page.waitForTimeout(200)
check('manager: new employee card visible', await page.getByText('Игорь Тестов').isVisible())

// open new employee page, create task
await page.locator('a[href*="/manager/employees/"]', { hasText: 'Игорь Тестов' }).click()
await page.waitForURL(/\/manager\/employees\/.+/)
await page.waitForSelector('text=Назад к команде')
await page.getByRole('button', { name: 'Новая задача' }).click()
await page.getByLabel('Название').fill('Изучить Git')
await page.getByLabel('Компетенция').fill('Инструменты')
await page.getByLabel('Описание').fill('Освоить базовые команды git и сделать первый PR.')
// manager keeps checklist: add 2 items 60/40
await page.getByPlaceholder('Условие выполнения, например: посмотреть видео').fill('Пройти интерактивный курс')
await page.locator('input[type="number"]').fill('60')
await page.getByRole('button', { name: 'Добавить условие' }).click()
await page.getByPlaceholder('Условие выполнения, например: посмотреть видео').nth(1).fill('Сделать учебный PR')
await page.locator('input[type="number"]').nth(1).fill('40')
await page.getByRole('button', { name: 'Сохранить условия' }).click()
await page.getByRole('button', { name: 'Создать' }).click()
await page.waitForTimeout(300)
check('task created and visible', await page.getByText('Изучить Git').isVisible())

// open task, add a choice question
await page.getByText('Изучить Git').click()
await page.waitForURL('**/tasks/**')
const taskUrl = page.url()
await page.getByRole('button', { name: 'Добавить вопрос' }).click()
await page.getByPlaceholder('Текст вопроса').fill('Какой командой создаётся ветка?')
await page.getByRole('button', { name: 'С вариантами (тест)' }).click()
await page.getByPlaceholder('Вариант 1').fill('git branch new')
await page.getByPlaceholder('Вариант 2').fill('git push')
await page.getByRole('button', { name: 'Отметить как правильный' }).first().click()
await page.getByRole('button', { name: 'Сохранить вопрос' }).click()
await page.waitForTimeout(200)
check('question saved', await page.getByText('Какой командой создаётся ветка?').isVisible())
await shot('f02-task-with-question')

// ---------- 3. Employee completes checklist, answers question ----------
await switchUser('Игорь Тестов')
await page.waitForURL('**/employee')
check('employee: stat tiles visible', await page.getByText('Моя средняя оценка').isVisible())
check('employee: sees assigned task', await page.getByText('Изучить Git').isVisible())
await page.getByText('Изучить Git').click()
await page.waitForURL('**/tasks/**')
await page.waitForSelector('text=Условия выполнения')
const cbs = page.getByRole('checkbox')
for (let i = 0; i < (await cbs.count()); i++) {
  if (!(await cbs.nth(i).isChecked())) {
    await cbs.nth(i).click()
    await page.waitForTimeout(150)
  }
}
check('employee: status На проверке', await page.getByText('На проверке').first().isVisible())
check('employee: prompted to answer questions', await page.getByText('Сначала ответьте на проверочные вопросы').isVisible())
await page.getByRole('button', { name: 'git branch new' }).click()
await page.waitForTimeout(200)
await shot('f03-employee-answered')

// ---------- 4. Manager: accept + assess ----------
await switchUser('Анна Соколова')
await page.goto(taskUrl)
await page.waitForSelector('text=Условия выполнения')
const acceptBtn = page.getByRole('button', { name: 'Принять' })
check('manager: Принять enabled after answers', !(await acceptBtn.isDisabled()))
await acceptBtn.click()
await page.waitForTimeout(200)
check('manager: task Завершено', await page.getByText('Завершено').first().isVisible())
check('manager: assessment form appears', await page.getByText('Оценка выполнения').isVisible())
await page.getByRole('button', { name: 'Сохранить оценку' }).click()
await page.waitForTimeout(200)
check('manager: assessment saved (badge)', await page.getByText('3 / 5').first().isVisible())
await shot('f04-task-assessed')

// ---------- 5. Manager dashboard ----------
await page.goto(`${base}/manager`)
await page.waitForTimeout(200)
check('dashboard: employee card shows score badge', (await page.locator('text=/\\d(\\.\\d)? \\/ 5/').count()) > 0)
await shot('f05-manager-dashboard')

// ---------- 6. Reports ----------
await page.getByText('Отчётность').click()
await page.waitForURL('**/manager/reports')
await page.waitForTimeout(200)
check('reports: weekly chart card', await page.getByText('Завершения по неделям').isVisible())
check('reports: competency chart', await page.getByText('Средняя оценка по компетенциям').isVisible())
check('reports: Инструменты competency listed', await page.getByText('Инструменты').first().isVisible())
check('reports: employee table has Игорь', await page.locator('table').getByText('Игорь Тестов').isVisible())
await shot('f06-reports')

// ---------- 7. Employee: skills profile ----------
await switchUser('Игорь Тестов')
await page.waitForURL('**/employee')
check('employee: Мои навыки visible', await page.getByText('Мои навыки').isVisible())
check('employee: Инструменты skill listed', await page.getByText('Инструменты').first().isVisible())
await shot('f07-employee-dashboard-final')

// ---------- 8. Delete task ----------
await switchUser('Анна Соколова')
await page.goto(taskUrl)
await page.waitForTimeout(200)
await page.getByRole('button', { name: 'Удалить задачу' }).click()
await page.getByRole('button', { name: 'Да, удалить' }).click()
await page.waitForURL('**/manager/employees/**')
check('delete: redirected to employee page', page.url().includes('/manager/employees/'))
check('delete: task gone', !(await page.getByText('Изучить Git').isVisible().catch(() => false)))
await shot('f08-after-delete')

// ---------- 9. Fallback route ----------
await page.goto(`${base}/nonexistent-route`)
await page.waitForTimeout(300)
check('fallback: redirected to /manager', page.url().endsWith('/manager'))

// ---------- 10. Overdue indicator (t3 in seed has past dueDate but confirmed; check t1 style not overdue; create quick overdue check via Мария) ----------
// seed t3 is completed → not overdue. Simply verify no console errors accumulated.
console.log('---')
console.log('runtime errors:', errors.length)
errors.forEach((e) => console.log('  ', e))
check('no runtime errors across all flows', errors.length === 0)

console.log('---')
console.log(failed === 0 ? 'ALL CHECKS PASSED' : `${failed} CHECKS FAILED`)
await browser.close()
process.exit(failed === 0 ? 0 : 1)
