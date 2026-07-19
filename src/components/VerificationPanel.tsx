import { useState } from 'react'
import { CheckCircle2, Plus, Trash2, XCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { DevelopmentTask, QuestionType, VerificationQuestion } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export function VerificationPanel({ task, currentUserId }: { task: DevelopmentTask; currentUserId: string }) {
  const addVerificationQuestion = useAppStore((s) => s.addVerificationQuestion)
  const removeVerificationQuestion = useAppStore((s) => s.removeVerificationQuestion)
  const answerVerificationQuestion = useAppStore((s) => s.answerVerificationQuestion)

  const isCreator = task.createdById === currentUserId
  const isAssignee = task.assigneeId === currentUserId
  const [adding, setAdding] = useState(false)

  const questions = task.verificationQuestions

  if (questions.length === 0 && !adding && !isCreator) return null

  return (
    <Card className="mb-6">
      <CardContent className="space-y-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Проверочные вопросы</h2>
          {isCreator && !adding && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAdding(true)}>
              <Plus className="h-3.5 w-3.5" /> Добавить вопрос
            </Button>
          )}
        </div>

        {questions.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">
            Добавьте вопрос или мини-тест, который сотрудник пройдёт перед вашим подтверждением.
          </p>
        )}

        {questions.length > 0 && (
          <div className="space-y-3">
            {questions.map((question) => (
              <QuestionRow
                key={question.id}
                question={question}
                isCreator={isCreator}
                isAssignee={isAssignee}
                onAnswer={(answer) => answerVerificationQuestion(task.id, question.id, answer)}
                onRemove={() => removeVerificationQuestion(task.id, question.id)}
              />
            ))}
          </div>
        )}

        {isCreator && adding && (
          <NewQuestionForm
            onSave={(input) => {
              addVerificationQuestion(task.id, input)
              setAdding(false)
            }}
            onCancel={() => setAdding(false)}
          />
        )}
      </CardContent>
    </Card>
  )
}

function QuestionRow({
  question,
  isCreator,
  isAssignee,
  onAnswer,
  onRemove,
}: {
  question: VerificationQuestion
  isCreator: boolean
  isAssignee: boolean
  onAnswer: (answer: { answerText?: string; selectedOptionIndex?: number }) => void
  onRemove: () => void
}) {
  const [draftText, setDraftText] = useState('')
  const answered = question.type === 'open' ? !!question.answerText : question.selectedOptionIndex !== undefined

  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{question.text}</p>
        {isCreator && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {question.type === 'open' ? (
        answered ? (
          <p className="rounded-md bg-muted px-2.5 py-2 text-sm">{question.answerText}</p>
        ) : isAssignee ? (
          <div className="space-y-2">
            <Textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={2}
              placeholder="Ваш ответ..."
            />
            <Button size="sm" disabled={!draftText.trim()} onClick={() => onAnswer({ answerText: draftText.trim() })}>
              Ответить
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Ожидает ответа сотрудника.</p>
        )
      ) : (
        <div className="space-y-1.5">
          {(question.options ?? []).map((option, i) => {
            const isSelected = question.selectedOptionIndex === i
            const isCorrect = question.correctOptionIndex === i

            if (!answered && isAssignee) {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onAnswer({ selectedOptionIndex: i })}
                  className="block w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                >
                  {option}
                </button>
              )
            }

            return (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                  answered && isSelected && isCorrect && 'border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30',
                  answered && isSelected && !isCorrect && 'border-rose-300 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30',
                )}
              >
                <span className="flex-1">{option}</span>
                {isCorrect && (answered || isCreator) && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                {answered && isSelected && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-rose-600" />}
              </div>
            )
          })}
          {!answered && !isAssignee && <p className="text-sm text-muted-foreground">Ожидает ответа сотрудника.</p>}
        </div>
      )}
    </div>
  )
}

function NewQuestionForm({
  onSave,
  onCancel,
}: {
  onSave: (input: { text: string; type: QuestionType; options?: string[]; correctOptionIndex?: number }) => void
  onCancel: () => void
}) {
  const [text, setText] = useState('')
  const [type, setType] = useState<QuestionType>('open')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [correctIndex, setCorrectIndex] = useState(0)

  const filledOptions = options.map((o) => o.trim()).filter(Boolean)
  const canSave = text.trim().length > 0 && (type === 'open' || filledOptions.length >= 2)

  function updateOption(i: number, value: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)))
  }

  function addOption() {
    if (options.length >= 5) return
    setOptions((prev) => [...prev, ''])
  }

  function removeOption(i: number) {
    setOptions((prev) => prev.filter((_, idx) => idx !== i))
    setCorrectIndex((prev) => (prev === i ? 0 : prev > i ? prev - 1 : prev))
  }

  function handleSave() {
    onSave({
      text: text.trim(),
      type,
      options: type === 'choice' ? filledOptions : undefined,
      correctOptionIndex: type === 'choice' ? correctIndex : undefined,
    })
  }

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Текст вопроса" />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType('open')}
          className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
            type === 'open' ? 'border-primary bg-primary/5 font-medium' : 'hover:bg-accent'
          }`}
        >
          Открытый вопрос
        </button>
        <button
          type="button"
          onClick={() => setType('choice')}
          className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
            type === 'choice' ? 'border-primary bg-primary/5 font-medium' : 'hover:bg-accent'
          }`}
        >
          С вариантами (тест)
        </button>
      </div>

      {type === 'choice' && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Отметьте правильный вариант</p>
          {options.map((option, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrectIndex(i)}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  correctIndex === i ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-input'
                }`}
                aria-label="Отметить как правильный"
              >
                {correctIndex === i && <CheckCircle2 className="h-3.5 w-3.5" />}
              </button>
              <Input
                value={option}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Вариант ${i + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeOption(i)}
                disabled={options.length <= 2}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addOption} disabled={options.length >= 5}>
            <Plus className="h-3.5 w-3.5" /> Добавить вариант
          </Button>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button size="sm" disabled={!canSave} onClick={handleSave}>
          Сохранить вопрос
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </div>
  )
}
