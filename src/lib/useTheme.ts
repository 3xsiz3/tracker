import { useCallback, useEffect, useState } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'

function readStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  const stored = window.localStorage.getItem('theme')
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

function resolveIsDark(preference: ThemePreference) {
  if (preference === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches
  return preference === 'dark'
}

function applyTheme(preference: ThemePreference) {
  document.documentElement.classList.toggle('dark', resolveIsDark(preference))
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readStoredPreference)

  useEffect(() => {
    applyTheme(preference)
    if (preference !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyTheme('system')
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [preference])

  const setTheme = useCallback((next: ThemePreference) => {
    setPreference(next)
    if (next === 'system') window.localStorage.removeItem('theme')
    else window.localStorage.setItem('theme', next)
  }, [])

  return { preference, setTheme }
}
