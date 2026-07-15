import type { Assessment, AssessmentCriteria, DevelopmentTask } from '@/types'

export function assessmentOverall(a: AssessmentCriteria): number {
  return Math.round(((a.quality + a.timeliness + a.autonomy) / 3) * 10) / 10
}

export interface CompetencySkill {
  competency: string
  quality: number
  timeliness: number
  autonomy: number
  overall: number
  taskCount: number
}

export function competencySkills(tasks: DevelopmentTask[], assessments: Assessment[]): CompetencySkill[] {
  const byCompetency = new Map<string, Assessment[]>()

  for (const task of tasks) {
    const assessment = assessments.find((a) => a.taskId === task.id)
    if (!assessment) continue
    const list = byCompetency.get(task.competency) ?? []
    list.push(assessment)
    byCompetency.set(task.competency, list)
  }

  const round = (n: number) => Math.round(n * 10) / 10

  return Array.from(byCompetency.entries()).map(([competency, list]) => {
    const quality = round(list.reduce((sum, a) => sum + a.quality, 0) / list.length)
    const timeliness = round(list.reduce((sum, a) => sum + a.timeliness, 0) / list.length)
    const autonomy = round(list.reduce((sum, a) => sum + a.autonomy, 0) / list.length)
    return {
      competency,
      quality,
      timeliness,
      autonomy,
      overall: round((quality + timeliness + autonomy) / 3),
      taskCount: list.length,
    }
  })
}
