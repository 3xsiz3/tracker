import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { AlertCircle, Sparkles } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginPage() {
  const currentUserId = useAppStore((s) => s.currentUserId)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (currentUserId) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) setError('Неверный email или пароль.')
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_45%_at_50%_-5%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent)]"
      />

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-inset ring-white/15">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Развитие навыков</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Войдите, чтобы продолжить</p>
        </div>

        <Card className="shadow-xl shadow-black/[0.03] dark:shadow-black/20">
          <CardContent className="py-6">
            <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={error ? true : undefined}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={error ? true : undefined}
                />
              </div>
              {error && (
                <p className="flex items-center gap-1.5 text-sm text-destructive" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </p>
              )}
              <Button type="submit" disabled={loading} className="mt-1">
                {loading ? 'Входим…' : 'Войти'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
