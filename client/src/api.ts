/**
 * API module — all requests use root-relative paths (/api/...) so they hit
 * the same origin that serves the built app. Never hardcode a host or port.
 *
 * Every failed request throws an ApiError. A 401 additionally dispatches a
 * window-level 'api:unauthorized' event so the app can clear the session and
 * redirect to /login in one place, regardless of which store triggered it.
 */

import type {
  User,
  Collection,
  KBDocument,
  UploadResult,
  Conversation,
  Message,
  ChatDonePayload,
  AdminUser,
  AuditEntry,
  ExportFormat,
  ExportResult,
  Role,
  ComplexityLevel,
  BookmarkedMessage,
} from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    if (res.status === 401) {
      window.dispatchEvent(new Event('api:unauthorized'))
    }
    throw new ApiError(res.status, body?.error ?? 'Something went wrong')
  }
  return res.json() as Promise<T>
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  async login(email: string, password: string): Promise<{ user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return handleResponse(res)
  },

  async logout(): Promise<{ ok: true }> {
    const res = await fetch('/api/auth/logout', { method: 'POST' })
    return handleResponse(res)
  },

  async me(): Promise<{ user: User | null }> {
    const res = await fetch('/api/auth/me')
    return handleResponse(res)
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ ok: true }> {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    return handleResponse(res)
  },
}

// ─── Collections ─────────────────────────────────────────────────────────────

export const collectionsApi = {
  async list(): Promise<{ collections: Collection[] }> {
    const res = await fetch('/api/collections')
    return handleResponse(res)
  },

  async create(name: string, description?: string): Promise<Collection> {
    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    })
    return handleResponse(res)
  },
}

// ─── Documents ───────────────────────────────────────────────────────────────

export const documentsApi = {
  async list(collectionId?: string): Promise<{ documents: KBDocument[] }> {
    const url = collectionId
      ? `/api/documents?collectionId=${encodeURIComponent(collectionId)}`
      : '/api/documents'
    const res = await fetch(url)
    return handleResponse(res)
  },

  async upload(file: File, collectionId: string): Promise<UploadResult> {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('collectionId', collectionId)
    const res = await fetch('/api/documents/upload', { method: 'POST', body: fd })
    return handleResponse(res)
  },

  async ingestUrl(url: string, collectionId: string): Promise<{ id: string; title: string; status: string }> {
    const res = await fetch('/api/documents/url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, collectionId }),
    })
    return handleResponse(res)
  },

  async reindex(id: string): Promise<{ id: string; version: number; status: string }> {
    const res = await fetch(`/api/documents/${id}/reindex`, { method: 'POST' })
    return handleResponse(res)
  },

  async remove(id: string): Promise<{ ok: true }> {
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    return handleResponse(res)
  },
}

// ─── Conversations ────────────────────────────────────────────────────────────

export const conversationsApi = {
  async list(): Promise<{ conversations: Conversation[] }> {
    const res = await fetch('/api/conversations')
    return handleResponse(res)
  },

  async create(): Promise<{ id: string; title: string; createdAt: string }> {
    const res = await fetch('/api/conversations', { method: 'POST' })
    return handleResponse(res)
  },

  async messages(id: string): Promise<{ messages: Message[] }> {
    const res = await fetch(`/api/conversations/${id}/messages`)
    return handleResponse(res)
  },

  /**
   * Sends a message and returns an async iterator of stream events.
   * Each yielded string is a raw SSE data line payload (JSON).
   */
  async *chat(
    conversationId: string,
    content: string,
    complexityLevel: ComplexityLevel
  ): AsyncGenerator<string> {
    const res = await fetch(`/api/conversations/${conversationId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, complexityLevel }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      if (res.status === 401) {
        window.dispatchEvent(new Event('api:unauthorized'))
      }
      throw new ApiError(res.status, body?.error ?? 'Something went wrong')
    }
    const reader = res.body?.getReader()
    if (!reader) return
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          yield line.slice(6)
        }
      }
    }
  },

  async bookmark(messageId: string, bookmarked: boolean): Promise<{ id: string; bookmarked: boolean }> {
    const res = await fetch(`/api/messages/${messageId}/bookmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmarked }),
    })
    return handleResponse(res)
  },

  async exportMessage(messageId: string, format: ExportFormat): Promise<ExportResult> {
    const res = await fetch(`/api/messages/${messageId}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format }),
    })
    return handleResponse(res)
  },

  async bookmarked(): Promise<{ messages: BookmarkedMessage[] }> {
    const res = await fetch('/api/messages/bookmarked')
    return handleResponse(res)
  },
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export const adminApi = {
  async listUsers(): Promise<{ users: AdminUser[] }> {
    const res = await fetch('/api/admin/users')
    return handleResponse(res)
  },

  async createUser(payload: {
    name: string
    email: string
    password: string
    role: Role
  }): Promise<AdminUser> {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return handleResponse(res)
  },

  async updateUserRole(id: string, role: Role): Promise<{ id: string; role: Role }> {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    return handleResponse(res)
  },

  async auditLog(): Promise<{ entries: AuditEntry[] }> {
    const res = await fetch('/api/admin/audit')
    return handleResponse(res)
  },
}
