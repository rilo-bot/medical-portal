import { create } from 'zustand'
import { authApi } from '@/api'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  /** True once the initial session check (init) has resolved, success or not. */
  initialized: boolean
  error: string | null

  // actions (frozen contract)
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  error: null,

  /** Called once on app mount — tries to restore a server session. */
  init: async () => {
    set({ loading: true })
    try {
      const data = await authApi.me()
      set({ user: data.user, loading: false, initialized: true })
    } catch {
      set({ user: null, loading: false, initialized: true })
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const data = await authApi.login(email, password)
      set({ user: data.user, loading: false })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      set({ loading: false, error: msg })
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore network errors on logout — clear local session regardless
    }
    set({ user: null })
  },

  clearError: () => set({ error: null }),
}))
