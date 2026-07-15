import { AlertTriangle, ClipboardCheck, Clock, Star } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardContent } from '@/components/ui/card'
import { StatTile } from '@/components/StatTile'
import { BarStat } from '@/components/charts/BarStat'
import { taskStatus } from '@/lib/task'
import { isOverdue, weeklyCompletions, employeeReportRows } from '@/lib/reports'
import { competencySkills, assessmentOverall } from '@/lib/skills'
import { userLabel } from '@/lib/selectors'

export function ManagerReportsPage() {
  const currentUserId = useAppStore((s) => s.currentUserId)!
  const users = useAppStore((s) => s.users)
  const tasks = useAppStore((s) => s.tasks)
  const assessments = useAppStore((s) => s.assessments)

  const employees = users.filter((u) => u.role === 'employee' && u.managerId === currentUserId)
  const teamTasks = tasks.filter((t) => employees.some((e) => e.id === t.assigneeId))
  const teamAssessments = assessments.filter((a) => teamTasks.some((t) => t.id === a.taskId))

  const overdueCount = teamTasks.filter(isOverdue).length
  const pendingReviewCount = teamTasks.filter((t) => taskStatus(t) === 'pending_review').length
  const avgTeamScore = teamAssessments.length
    ? Math.round((teamAssessments.reduce((sum, a) => sum + assessmentOverall(a), 0) / teamAssessments.length) * 10) / 10
    : 0

  const weeks = weeklyCompletions(teamTasks, 8)
  const weeksMax = Math.max(...weeks.map((w) => w.count), 1)

  const skills = [...competencySkills(teamTasks, teamAssessments)].sort((a, b) => b.overall - a.overall)
  const rows = employeeReportRows(employees, tasks, assessments)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Отчётность</h1>
        <p className="text-sm text-muted-foreground">Аналитика по команде: прогресс, оценки, просроченные задачи</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={AlertTriangle} label="Просрочено" value={overdueCount} accent="text-rose-600 bg-rose-500/10" />
        <StatTile icon={Clock} label="Ожидают проверки" value={pendingReviewCount} accent="text-amber-600 bg-amber-500/10" />
        <StatTile icon={ClipboardCheck} label="Оценено задач" value={teamAssessments.length} accent="text-blue-600 bg-blue-500/10" />
        <StatTile
          icon={Star}
          label="Средняя оценка"
          value={teamAssessments.length ? `${avgTeamScore} / 5` : '—'}
          accent="text-violet-600 bg-violet-500/10"
        />
      </div>

      <Card className="mb-6">
        <CardContent className="py-4">
          <h2 className="mb-4 text-sm font-medium">Завершения по неделям</h2>
          <BarStat
            orientation="vertical"
            max={weeksMax}
            items={weeks.map((w) => ({
              key: w.weekStart,
              label: w.label,
              value: w.count,
              displayValue: String(w.count),
              tooltip: `Неделя с ${w.label}: ${w.count} ${w.count === 1 ? 'задача' : 'задач'} завершено`,
            }))}
          />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="py-4">
          <h2 className="mb-4 text-sm font-medium">Средняя оценка по компетенциям</h2>
          {skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока нет оценённых задач.</p>
          ) : (
            <BarStat
              orientation="horizontal"
              max={5}
              items={skills.map((s) => ({
                key: s.competency,
                label: s.competency,
                value: s.overall,
                displayValue: `${s.overall} / 5`,
                tooltip: `${s.competency}: ${s.taskCount} ${s.taskCount === 1 ? 'задача' : 'задачи'}`,
              }))}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <h2 className="mb-4 text-sm font-medium">Сотрудники</h2>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">В команде пока нет сотрудников.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Сотрудник</th>
                    <th className="pb-2 font-medium">Задач</th>
                    <th className="pb-2 font-medium">Завершено</th>
                    <th className="pb-2 font-medium">% выполнения</th>
                    <th className="pb-2 font-medium">Средняя оценка</th>
                    <th className="pb-2 font-medium">Просрочено</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.employeeId} className="border-b last:border-0">
                      <td className="py-2">{userLabel(users, row.employeeId)}</td>
                      <td className="py-2">{row.totalTasks}</td>
                      <td className="py-2">{row.completedTasks}</td>
                      <td className="py-2">{row.completionRate}%</td>
                      <td className="py-2">{row.avgScore !== null ? `${row.avgScore} / 5` : '—'}</td>
                      <td className="py-2">
                        {row.overdueCount > 0 ? (
                          <span className="font-medium text-rose-600">{row.overdueCount}</span>
                        ) : (
                          row.overdueCount
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
