// ─── Auth ────────────────────────────────────────────────────────────────────

export type Role = 'admin' | 'doctor'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

// ─── Collections ─────────────────────────────────────────────────────────────

export interface Collection {
  id: string
  name: string
  description: string
  documentCount: number
  createdAt: string
}

// ─── Documents ───────────────────────────────────────────────────────────────

export type DocumentStatus = 'processing' | 'indexed' | 'failed'
export type SourceType = 'pdf' | 'docx' | 'txt' | 'html' | 'url'

export interface KBDocument {
  id: string
  collectionId: string
  title: string
  sourceType: string
  version: number
  status: DocumentStatus
  pageCount: number | null
  createdAt: string
}

export interface UploadResult {
  id: string
  title: string
  status: DocumentStatus
  duplicate: boolean
}

// ─── Chat & Messages ─────────────────────────────────────────────────────────

export type ComplexityLevel = 'consultant' | 'gp' | 'student' | 'patient'

export interface Citation {
  documentId: string
  title: string
  section: string | null
  page: number | null
  snippet: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  complexityLevel: string | null
  confidence: number | null
  citations: Citation[]
  supplemental: boolean
  bookmarked: boolean
  createdAt: string
}

export interface Conversation {
  id: string
  title: string
  updatedAt: string
}

export interface BookmarkedMessage extends Message {
  conversationId: string
  conversationTitle: string
}

export interface ChatDonePayload {
  id: string
  content: string
  confidence: number | null
  sourceCount: number
  supplemental: boolean
  citations: Citation[]
  followUps: string[]
}

export interface StreamToken {
  type: 'token'
  value: string
}

export interface StreamDone {
  type: 'done'
  message: ChatDonePayload
}

export type StreamEvent = StreamToken | StreamDone

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  name: string
  email: string
  role: Role
  createdAt: string
}

export interface AuditEntry {
  id: string
  userId: string
  action: string
  detail: string
  createdAt: string
}

// ─── Export ──────────────────────────────────────────────────────────────────

export type ExportFormat = 'pdf' | 'docx'

export interface ExportResult {
  url: string
  filename: string
}
