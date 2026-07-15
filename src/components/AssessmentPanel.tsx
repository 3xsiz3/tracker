import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { AssessmentCriteria, DevelopmentTask } from '@/types'
import { ASSESSMENT_CRITERIA_LABELS } from '@/types'
import { taskStatus } from '@/lib/task'
import { assessmentOverall } from '@/lib/skills'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

const CRITERIA_KEYS: (keyof AssessmentCriteria)[] = ['quality', 'timeliness', 'autonomy']
const DEFAULT_DRAFT: AssessmentCriteria = { quality: 3, timeliness: 3, autonomy: 3 }

export function AssessmentPanel({ task, currentUserId }: { task: DevelopmentTask; currentUserId: string }) {
  const assessments = useAppStore((s) => s.assessments)
  const submitAssessment = useAppStore((s) => s.submitAssessment)
  const assessment = assessments.find((a) => a.taskId === task.id)
  const isManager = currentUserId === task.createdById
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<AssessmentCriteria>(DEFAULT_DRAFT)

  if (taskStatus(task) !== 'completed') return null

  function startEditing() {
    setDraft(assessment ? { quality: assessment.quality, timeliness: assessment.timeliness, autonomy: assessment.autonomy } : DEFAULT_DRAFT)
    setEditing(true)
  }

  function handleSubmit() {
    submitAssessment(task.id, currentUserId, draft)
    setEditing(false)
  }

  const showForm = isManager && (editing || !assessment)

  return (
    <Card className="mb-6">
      <CardContent className="space-y-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Оценка выполнения</h2>
          {assessment && !showForm && <Badge variant="secondary">{assessmentOverall(assessment)} / 5</Badge>}
        </div>

        {showForm ? (
          <div className="space-y-4">
            {CRITERIA_KEYS.map((key) => (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{ASSESSMENT_CRITERIA_LABELS[key]}</span>
                  <span className="text-xs text-muted-foreground">{draft[key]} / 5</span>
                </div>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[draft[key]]}
                  onValueChange={([v]) => setDraft((d) => ({ ...d, [key]: v }))}
                />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-1">
              {assessment && (
                <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                  Отмена
                </Button>
              )}
              <Button size="sm" onClick={handleSubmit}>
                Сохранить оценку
              </Button>
            </div>
          </div>
        ) : assessment ? (
          <div className="space-y-2">
            {CRITERIA_KEYS.map((key) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{ASSESSMENT_CRITERIA_LABELS[key]}</span>
                <span className="font-medium">{assessment[key]} / 5</span>
              </div>
            ))}
            {isManager && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={startEditing}>
                <Pencil className="h-3 w-3" /> Изменить
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Руководитель ещё не оценил выполнение.</p>
        )}
      </CardContent>
    </Card>
  )
}
