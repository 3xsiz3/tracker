import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme, type ThemePreference } from '@/lib/useTheme'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ORDER: ThemePreference[] = ['light', 'dark', 'system']
const ICON = { light: Sun, dark: Moon, system: Monitor }
const LABEL: Record<ThemePreference, string> = {
  light: 'Светлая тема',
  dark: 'Тёмная тема',
  system: 'Как в системе',
}

export function ThemeToggle({ className }: { className?: string }) {
  const { preference, setTheme } = useTheme()
  const Icon = ICON[preference]

  function cycle() {
    const next = ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length]
    setTheme(next)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={cycle}
      className={cn('w-full justify-start text-muted-foreground', className)}
      aria-label={`Тема оформления: ${LABEL[preference]}. Нажмите, чтобы переключить.`}
    >
      <Icon className="h-4 w-4" /> {LABEL[preference]}
    </Button>
  )
}
