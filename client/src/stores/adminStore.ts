import { create } from 'zustand'
import { adminApi } from '@/api'
import type { AdminUser, AuditEntry, Role } from '@/types'

// ─── State ───────────────────────────────────────────────────────────────────

interface AdminState {
  users: AdminUser[]
  auditEntries: AuditEntry[]
  loadingUsers: boolean
  loadingAudit: boolean
  error: string | null

  // actions (frozen contract)
  loadUsers: () => Promise<void>
  loadAudit: () => Promise<void>
  createUser: (payload: { name: string; email: string; password: string; role: Role }) => Promise<void>
  updateUserRole: (id: string, role: Role) => Promise<void>
  clearError: () => void
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAdminStore = create<AdminState>((set) => ({
  users: [],
  auditEntries: [],
  loadingUsers: false,
  loadingAudit: false,
  error: null,

  loadUsers: async () => {
    set({ loadingUsers: true, error: null })
    try {
      const data = await adminApi.listUsers()
      set({ users: data.users, loadingUsers: false })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load users'
      set({ loadingUsers: false, error: msg })
    }
  },

  loadAudit: async () => {
    set({ loadingAudit: true, error: null })
    try {
      const data = await adminApi.auditLog()
      set({ auditEntries: data.entries, loadingAudit: false })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load audit log'
      set({ loadingAudit: false, error: msg })
    }
  },

  createUser: async (payload) => {
    set({ error: null })
    try {
      const user = await adminApi.createUser(payload)
      set((s) => ({ users: [...s.users, user] }))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      set({ error: msg })
      throw new Error(msg)
    }
  },

  updateUserRole: async (id, role) => {
    const previous = useAdminStore.getState().users
    // Optimistic update first
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, role } : u)),
    }))
    try {
      await adminApi.updateUserRole(id, role)
    } catch (err: unknown) {
      // Revert on failure — do not keep an optimistic state that doesn't match the server
      set({ users: previous })
      const msg = err instanceof Error ? err.message : 'Failed to update role'
      set({ error: msg })
      throw new Error(msg)
    }
  },

  clearError: () => set({ error: null }),
}))
