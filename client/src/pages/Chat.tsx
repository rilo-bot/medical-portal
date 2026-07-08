import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangleIcon, XIcon, ChevronRightIcon } from 'lucide-react'
import { useChatStore } from '@/stores/chatStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { Citation } from '@/types'

import ConversationSidebar from '@/components/chat/ConversationSidebar'
import MessageBubble from '@/components/chat/MessageBubble'
import StreamingBubble from '@/components/chat/StreamingBubble'
import CitationsPanel from '@/components/chat/CitationsPanel'
import ChatInput from '@/components/chat/ChatInput'
import EmptyState from '@/components/chat/EmptyState'

// ─── Local follow-up map ──────────────────────────────────────────────────────
// The Message type doesn't carry followUps — we track them locally per message-id
type FollowUpMap = Record<string, string[]>

export default function Chat() {
  const { conversationId: urlConvId } = useParams<{ conversationId?: string }>()
  const navigate = useNavigate()

  // ─── Store (flat primitive selectors — no new objects in render) ─────────────
  const conversations   = useChatStore((s) => s.conversations)
  const activeId        = useChatStore((s) => s.activeConversationId)
  const messages        = useChatStore((s) => s.messages)
  const streaming       = useChatStore((s) => s.streaming)
  const complexityLevel = useChatStore((s) => s.complexityLevel)
  const loading         = useChatStore((s) => s.loading)
  const sending         = useChatStore((s) => s.sending)
  const error           = useChatStore((s) => s.error)

  const loadConversations  = useChatStore((s) => s.loadConversations)
  const selectConversation = useChatStore((s) => s.selectConversation)
  const newConversation    = useChatStore((s) => s.newConversation)
  const sendMessage        = useChatStore((s) => s.sendMessage)
  const setComplexityLevel = useChatStore((s) => s.setComplexityLevel)
  const bookmarkMessage    = useChatStore((s) => s.bookmarkMessage)
  const clearError         = useChatStore((s) => s.clearError)

  const autoScroll   = useSettingsStore((s) => s.autoScroll)
  const showCitations = useSettingsStore((s) => s.showCitations)

  // ─── Local state ─────────────────────────────────────────────────────────────
  const [activeCitationMsgId, setActiveCitationMsgId] = useState<string | null>(null)
  const [citationsForPanel, setCitationsForPanel]     = useState<Citation[]>([])
  const [followUps, setFollowUps]                     = useState<FollowUpMap>({})
  const [prefill, setPrefill]                         = useState<string | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ─── On mount: load conversations, optionally select from URL ────────────────
  useEffect(() => {
    loadConversations().then(() => {
      if (urlConvId) selectConversation(urlConvId)
    })
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Capture followUps when streaming completes ───────────────────────────
  const prevStreamingRef = useRef(streaming)
  useEffect(() => {
    const prev = prevStreamingRef.current
    if (prev && prev.done && !streaming && prev.followUps?.length) {
      setFollowUps((m) => {
        // The last assistant message was just pushed into `messages`
        const lastAssistant = [...messages].reverse().find((msg) => msg.role === 'assistant')
        if (lastAssistant) return { ...m, [lastAssistant.id]: prev.followUps }
        return m
      })
    }
    prevStreamingRef.current = streaming
  }, [streaming, messages])

  // ─── Scroll to bottom on new content ─────────────────────────────────────
  useEffect(() => {
    if (!autoScroll) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, streaming?.content, autoScroll])

  // ─── Auto-open the citations panel when a cited answer arrives ───────────
  const prevMessageCountRef = useRef(messages.length)
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current && showCitations) {
      const last = messages[messages.length - 1]
      if (last?.role === 'assistant' && last.citations.length > 0) {
        setCitationsForPanel(last.citations)
        setActiveCitationMsgId(last.id)
      }
    }
    prevMessageCountRef.current = messages.length
  }, [messages, showCitations])

  // ─── Derive active conversation title ────────────────────────────────────
  const activeTitle = useMemo(
    () => conversations.find((c) => c.id === activeId)?.title ?? null,
    [conversations, activeId]
  )

  const lastAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i].id
    }
    return null
  }, [messages])

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleNewConversation = useCallback(async () => {
    try {
      await newConversation()
    } catch {
      return
    }
    setActiveCitationMsgId(null)
    setCitationsForPanel([])
    navigate('/chat', { replace: true })
  }, [newConversation, navigate])

  const handleSelectConversation = useCallback(async (id: string) => {
    await selectConversation(id)
    setActiveCitationMsgId(null)
    setCitationsForPanel([])
  }, [selectConversation])

  const handleSend = useCallback(async (content: string) => {
    if (!activeId) {
      try {
        await newConversation()
      } catch {
        return
      }
    }
    await sendMessage(content)
  }, [activeId, newConversation, sendMessage])

  const handleSelectCitation = useCallback((citations: Citation[], messageId: string) => {
    setCitationsForPanel(citations)
    setActiveCitationMsgId((prev) => (prev === messageId ? null : messageId))
  }, [])

  const handleCloseCitations = useCallback(() => {
    setActiveCitationMsgId(null)
    setCitationsForPanel([])
  }, [])

  const handleFollowUp = useCallback((text: string) => {
    setPrefill(text)
  }, [])

  const handlePrefillConsumed = useCallback(() => {
    setPrefill(undefined)
  }, [])

  const handleSuggestion = useCallback(async (text: string) => {
    if (!activeId) {
      try {
        await newConversation()
      } catch {
        return
      }
    }
    await sendMessage(text)
  }, [activeId, newConversation, sendMessage])

  const citationsPanelOpen = activeCitationMsgId !== null

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background">

      {/* ── LEFT: Conversation sidebar ─────────────────────────────────────── */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        loading={loading && messages.length === 0}
      />

      {/* ── CENTER: Main chat column ───────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Conversation header bar */}
        {activeTitle && (
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
            <span className="text-xs text-muted-foreground">Chat</span>
            <ChevronRightIcon className="w-3 h-3 text-muted-foreground/40" />
            <span className="text-xs font-medium text-foreground truncate max-w-xs">{activeTitle}</span>
          </div>
        )}

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border-b border-destructive/20 text-destructive text-sm shrink-0"
            >
              <AlertTriangleIcon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={clearError} className="p-1 hover:opacity-70 transition-opacity">
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message scroll area */}
        <div className="flex-1 overflow-y-auto">
          {loading && messages.length === 0 ? (
            /* Loading skeleton */
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                  {[0, 0.15, 0.3].map((d, i) => (
                    <motion.span
                      key={i}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: d }}
                      className="w-2.5 h-2.5 rounded-full bg-brand/40"
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Loading conversation…</p>
              </div>
            </div>
          ) : messages.length === 0 && !streaming ? (
            /* Empty state */
            <EmptyState onSuggestion={handleSuggestion} />
          ) : (
            /* Messages */
            <div className="max-w-3xl mx-auto px-4 pt-6 pb-4 space-y-5">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onBookmark={bookmarkMessage}
                  onSelectCitation={handleSelectCitation}
                  activeCitationMessageId={activeCitationMsgId}
                  followUps={msg.id === lastAssistantId ? (followUps[msg.id] ?? []) : []}
                  onFollowUp={handleFollowUp}
                />
              ))}

              <AnimatePresence>
                {streaming && !streaming.done && (
                  <StreamingBubble key="streaming" content={streaming.content} />
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} className="h-2" />
            </div>
          )}
        </div>

        {/* Input bar */}
        <ChatInput
          onSend={handleSend}
          sending={sending}
          disabled={false}
          complexityLevel={complexityLevel}
          onComplexityChange={setComplexityLevel}
          prefill={prefill}
          onPrefillConsumed={handlePrefillConsumed}
        />
      </div>

      {/* ── RIGHT: Citations panel ─────────────────────────────────────────── */}
      <CitationsPanel
        citations={citationsForPanel}
        onClose={handleCloseCitations}
        isOpen={citationsPanelOpen}
      />
    </div>
  )
}
