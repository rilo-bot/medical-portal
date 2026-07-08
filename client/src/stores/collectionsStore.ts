import { create } from 'zustand'
import { collectionsApi } from '@/api'
import type { Collection } from '@/types'

// ─── State ───────────────────────────────────────────────────────────────────

interface CollectionsState {
  collections: Collection[]
  loading: boolean
  error: string | null

  // actions (frozen contract)
  load: () => Promise<void>
  create: (name: string, description?: string) => Promise<Collection>
  clearError: () => void
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useCollectionsStore = create<CollectionsState>((set) => ({
  collections: [],
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null })
    try {
      const data = await collectionsApi.list()
      set({ collections: data.collections, loading: false })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load collections'
      set({ loading: false, error: msg })
    }
  },

  create: async (name, description) => {
    set({ error: null })
    try {
      const col = await collectionsApi.create(name, description)
      set((s) => ({ collections: [col, ...s.collections] }))
      return col
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      set({ error: msg })
      throw new Error(msg)
    }
  },

  clearError: () => set({ error: null }),
}))
