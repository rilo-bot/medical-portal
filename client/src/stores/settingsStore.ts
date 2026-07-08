import { create } from 'zustand'
import type { ComplexityLevel } from '@/types'

export type ThemeOption = 'light' | 'dark' | 'system'

interface PersistedSettings {
  theme: ThemeOption
  complexityDefault: ComplexityLevel
  notifications: boolean
  showCitations: boolean
  autoScroll: boolean
  saveHistory: boolean
}

interface SettingsState extends PersistedSettings {
  setTheme: (t: ThemeOption) => void
  setComplexityDefault: (c: ComplexityLevel) => void
  setNotifications: (v: boolean) => void
  setShowCitations: (v: boolean) => void
  setAutoScroll: (v: boolean) => void
  setSaveHistory: (v: boolean) => void
}

const STORAGE_KEY = 'clinicalmind:settings'

const DEFAULTS: PersistedSettings = {
  theme: 'light',
  complexityDefault: 'gp',
  notifications: true,
  showCitations: true,
  autoScroll: true,
  saveHistory: true,
}

function loadPersisted(): PersistedSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return DEFAULTS
  }
}

function persist(s: PersistedSettings): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        theme: s.theme,
        complexityDefault: s.complexityDefault,
        notifications: s.notifications,
        showCitations: s.showCitations,
        autoScroll: s.autoScroll,
        saveHistory: s.saveHistory,
      })
    )
  } catch {
    // ignore storage errors (private browsing, quota)
  }
}

export function applyTheme(theme: ThemeOption): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', prefersDark)
  }
}

const initial = loadPersisted()
applyTheme(initial.theme)

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...initial,

  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
    persist(get())
  },
  setComplexityDefault: (complexityDefault) => {
    set({ complexityDefault })
    persist(get())
  },
  setNotifications: (notifications) => {
    set({ notifications })
    persist(get())
  },
  setShowCitations: (showCitations) => {
    set({ showCitations })
    persist(get())
  },
  setAutoScroll: (autoScroll) => {
    set({ autoScroll })
    persist(get())
  },
  setSaveHistory: (saveHistory) => {
    set({ saveHistory })
    persist(get())
  },
}))
