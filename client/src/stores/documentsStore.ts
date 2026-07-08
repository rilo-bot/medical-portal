import { create } from 'zustand'
import { documentsApi } from '@/api'
import type { KBDocument, UploadResult } from '@/types'

const POLL_INTERVAL_MS = 5_000

interface DocumentsState {
  documents: KBDocument[]
  loading: boolean
  error: string | null

  // polling handle (not exposed but tracked so we can clear it)
  _pollingHandle: ReturnType<typeof setInterval> | null

  // actions (frozen contract)
  load: (collectionId?: string) => Promise<void>
  upload: (file: File, collectionId: string) => Promise<UploadResult>
  ingestUrl: (url: string, collectionId: string) => Promise<void>
  reindex: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
  clearError: () => void

  // polling lifecycle
  startPolling: () => void
  stopPolling: () => void
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  loading: false,
  error: null,
  _pollingHandle: null,

  // ── load ─────────────────────────────────────────────────────────────────

  load: async (collectionId) => {
    set({ loading: true, error: null })
    try {
      const data = await documentsApi.list(collectionId)
      set({ documents: data.documents, loading: false })
      // After loading, start polling in case any docs are processing
      get().startPolling()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load documents'
      set({ loading: false, error: msg })
    }
  },

  // ── upload ───────────────────────────────────────────────────────────────

  upload: async (file, collectionId) => {
    set({ error: null })
    try {
      const result = await documentsApi.upload(file, collectionId)
      const newDoc: KBDocument = {
        id: result.id,
        collectionId,
        title: result.title,
        sourceType: file.name.split('.').pop() ?? 'pdf',
        version: 1,
        status: result.status,
        pageCount: null,
        createdAt: new Date().toISOString(),
      }
      set((s) => ({ documents: [newDoc, ...s.documents] }))
      // Ensure polling is running to pick up status changes from the backend
      get().startPolling()
      return result
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      set({ error: msg })
      throw new Error(msg)
    }
  },

  // ── ingestUrl ─────────────────────────────────────────────────────────────

  ingestUrl: async (url, collectionId) => {
    set({ error: null })
    try {
      const result = await documentsApi.ingestUrl(url, collectionId)
      const newDoc: KBDocument = {
        id: result.id,
        collectionId,
        title: result.title,
        sourceType: 'url',
        version: 1,
        status: result.status as KBDocument['status'],
        pageCount: null,
        createdAt: new Date().toISOString(),
      }
      set((s) => ({ documents: [newDoc, ...s.documents] }))
      get().startPolling()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      set({ error: msg })
      throw new Error(msg)
    }
  },

  // ── reindex ──────────────────────────────────────────────────────────────

  reindex: async (id) => {
    // Optimistic: mark as processing + increment version
    set((s) => ({
      documents: s.documents.map((d) =>
        d.id === id ? { ...d, status: 'processing' as const, version: d.version + 1 } : d
      ),
    }))
    try {
      await documentsApi.reindex(id)
      get().startPolling()
    } catch (err: unknown) {
      // Real backend error — revert optimistic increment and surface the failure
      set((s) => ({
        documents: s.documents.map((d) =>
          d.id === id ? { ...d, status: 'indexed' as const, version: Math.max(1, d.version - 1) } : d
        ),
      }))
      const msg = err instanceof Error ? err.message : 'Failed to reindex document'
      set({ error: msg })
    }
  },

  // ── remove ───────────────────────────────────────────────────────────────

  remove: async (id) => {
    const previous = get().documents
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) }))
    try {
      await documentsApi.remove(id)
    } catch (err: unknown) {
      // Revert — the document was not actually deleted server-side
      set({ documents: previous })
      const msg = err instanceof Error ? err.message : 'Failed to delete document'
      set({ error: msg })
      throw new Error(msg)
    }
  },

  // ── polling ───────────────────────────────────────────────────────────────

  /**
   * Start a 5-second polling loop that re-fetches documents with 'processing'
   * status from the API to pick up indexing state changes.
   */
  startPolling: () => {
    const existing = get()._pollingHandle
    if (existing !== null) return // already running

    const handle = setInterval(async () => {
      const docs = get().documents
      const processing = docs.filter((d) => d.status === 'processing')
      if (processing.length === 0) {
        get().stopPolling()
        return
      }

      const collectionIds = Array.from(new Set(processing.map((d) => d.collectionId)))
      try {
        const results = await Promise.all(collectionIds.map((id) => documentsApi.list(id)))
        const updatedById = new Map(results.flatMap((r) => r.documents).map((d) => [d.id, d]))
        set((s) => ({
          documents: s.documents.map((d) => updatedById.get(d.id) ?? d),
        }))
      } catch {
        // Transient poll failure — try again on the next interval tick
      }
    }, POLL_INTERVAL_MS)

    set({ _pollingHandle: handle })
  },

  stopPolling: () => {
    const handle = get()._pollingHandle
    if (handle !== null) {
      clearInterval(handle)
      set({ _pollingHandle: null })
    }
  },

  clearError: () => set({ error: null }),
}))
