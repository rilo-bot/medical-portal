import { create } from 'zustand'
import { conversationsApi } from '@/api'
import { useSettingsStore } from '@/stores/settingsStore'
import type { Conversation, Message, ComplexityLevel, Citation, BookmarkedMessage } from '@/types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface StreamingMessage {
  id: string
  content: string
  done: boolean
  confidence: number | null
  sourceCount: number | null
  supplemental: boolean
  citations: Citation[]
  followUps: string[]
}

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Message[]
  streaming: StreamingMessage | null
  complexityLevel: ComplexityLevel
  loading: boolean
  sending: boolean
  error: string | null

  /** Set when the user asks to stop the in-flight generation */
  stopRequested: boolean

  /** Follow-up question suggestions populated from the StreamDone event */
  followUps: string[]

  /** Bookmarked messages across all of the user's conversations (Saved Answers page) */
  savedMessages: BookmarkedMessage[]
  loadingSaved: boolean

  // actions (frozen contract)
  loadConversations: () => Promise<void>
  selectConversation: (id: string) => Promise<void>
  newConversation: () => Promise<string>
  sendMessage: (content: string) => Promise<void>
  stopStreaming: () => void
  setComplexityLevel: (level: ComplexityLevel) => void
  bookmarkMessage: (messageId: string, bookmarked: boolean) => Promise<void>
  loadSavedMessages: () => Promise<void>
  clearError: () => void
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  streaming: null,
  complexityLevel: useSettingsStore.getState().complexityDefault,
  loading: false,
  sending: false,
  error: null,
  stopRequested: false,
  followUps: [],
  savedMessages: [],
  loadingSaved: false,

  loadConversations: async () => {
    set({ loading: true, error: null })
    try {
      const data = await conversationsApi.list()
      set({ conversations: data.conversations, loading: false })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load conversations'
      set({ loading: false, error: msg })
    }
  },

  selectConversation: async (id) => {
    set({ activeConversationId: id, loading: true, error: null, messages: [], followUps: [] })
    try {
      const data = await conversationsApi.messages(id)
      // Guard against a stale response: if the user has since selected a
      // different conversation, don't clobber it with this late-arriving one.
      if (get().activeConversationId !== id) return
      set({ messages: data.messages, loading: false })
    } catch (err: unknown) {
      if (get().activeConversationId !== id) return
      const msg = err instanceof Error ? err.message : 'Failed to load messages'
      set({ loading: false, error: msg })
    }
  },

  newConversation: async () => {
    try {
      const data = await conversationsApi.create()
      const conv: Conversation = { id: data.id, title: data.title, updatedAt: data.createdAt }
      set((s) => ({
        conversations: [conv, ...s.conversations],
        activeConversationId: data.id,
        messages: [],
        followUps: [],
        complexityLevel: useSettingsStore.getState().complexityDefault,
      }))
      return data.id
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start a new conversation'
      set({ error: msg })
      throw err
    }
  },

  sendMessage: async (content) => {
    const { activeConversationId, complexityLevel } = get()
    if (!activeConversationId) return
    set({ error: null, sending: true, followUps: [], stopRequested: false })

    // Append the user message immediately
    const userMsg: Message = {
      id: `local-user-${Date.now()}`,
      role: 'user',
      content,
      complexityLevel: null,
      confidence: null,
      citations: [],
      supplemental: false,
      bookmarked: false,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({ messages: [...s.messages, userMsg] }))

    // Start streaming placeholder
    const streamId = `streaming-${Date.now()}`
    set({
      streaming: {
        id: streamId,
        content: '',
        done: false,
        confidence: null,
        sourceCount: null,
        supplemental: false,
        citations: [],
        followUps: [],
      },
    })

    try {
      const stream = conversationsApi.chat(activeConversationId, content, complexityLevel)
      let fullContent = ''
      for await (const raw of stream) {
        // User pressed stop — finalise whatever we have and leave the loop.
        if (get().stopRequested) break
        try {
          const event = JSON.parse(raw)
          if (event.type === 'token') {
            fullContent += event.value
            set((s) => ({
              streaming: s.streaming ? { ...s.streaming, content: fullContent } : null,
            }))
          } else if (event.type === 'done') {
            const msg = event.message
            const followUps: string[] = Array.isArray(msg.followUps) ? msg.followUps : []
            const assistantMsg: Message = {
              id: msg.id,
              role: 'assistant',
              content: msg.content,
              complexityLevel,
              confidence: msg.confidence,
              citations: msg.citations ?? [],
              supplemental: msg.supplemental ?? false,
              bookmarked: false,
              createdAt: new Date().toISOString(),
            }
            set((s) => ({
              messages: [...s.messages, assistantMsg],
              streaming: null,
              sending: false,
              followUps,
              conversations: s.conversations.map((c) =>
                c.id === activeConversationId ? { ...c, updatedAt: new Date().toISOString() } : c
              ),
            }))
            return
          }
        } catch {
          // skip malformed SSE lines
        }
      }
      // Stream ended without a 'done' event — finalise what we have
      if (fullContent) {
        const assistantMsg: Message = {
          id: `local-${Date.now()}`,
          role: 'assistant',
          content: fullContent,
          complexityLevel,
          confidence: null,
          citations: [],
          supplemental: true,
          bookmarked: false,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ messages: [...s.messages, assistantMsg], streaming: null, sending: false, stopRequested: false }))
      } else {
        set({ streaming: null, sending: false, stopRequested: false })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send message'
      set({ streaming: null, sending: false, stopRequested: false, error: msg })
    }
  },

  stopStreaming: () => set({ stopRequested: true }),

  setComplexityLevel: (level) => set({ complexityLevel: level }),

  bookmarkMessage: async (messageId, bookmarked) => {
    const previousMessages = get().messages
    const previousSaved = get().savedMessages
    // Optimistic UI first
    set((s) => ({
      messages: s.messages.map((m) => (m.id === messageId ? { ...m, bookmarked } : m)),
      savedMessages: bookmarked
        ? s.savedMessages
        : s.savedMessages.filter((m) => m.id !== messageId),
    }))
    try {
      await conversationsApi.bookmark(messageId, bookmarked)
    } catch (err: unknown) {
      set({ messages: previousMessages, savedMessages: previousSaved })
      const msg = err instanceof Error ? err.message : 'Failed to update bookmark'
      set({ error: msg })
    }
  },

  loadSavedMessages: async () => {
    set({ loadingSaved: true, error: null })
    try {
      const data = await conversationsApi.bookmarked()
      set({ savedMessages: data.messages, loadingSaved: false })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load saved answers'
      set({ loadingSaved: false, error: msg })
    }
  },

  clearError: () => set({ error: null }),
}))
