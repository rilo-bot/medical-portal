import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangleIcon, XIcon, MenuIcon, PlusIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, SunIcon, MoonIcon } from 'lucide-react'
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
  const stopStreaming      = useChatStore((s) => s.stopStreaming)
  const setComplexityLevel = useChatStore((s) => s.setComplexityLevel)
  const bookmarkMessage    = useChatStore((s) => s.bookmarkMessage)
  const clearError         = useChatStore((s) => s.clearError)

  const autoScroll   = useSettingsStore((s) => s.autoScroll)
  const showCitations = useSettingsStore((s) => s.showCitations)
  const theme        = useSettingsStore((s) => s.theme)
  const setTheme     = useSettingsStore((s) => s.setTheme)
  const dark = theme === 'dark'

  // ─── Local state ─────────────────────────────────────────────────────────────
  const [activeCitationMsgId, setActiveCitationMsgId] = useState<string | null>(null)
  const [citationsForPanel, setCitationsForPanel]     = useState<Citation[]>([])
  const [followUps, setFollowUps]                     = useState<FollowUpMap>({})
  const [prefill, setPrefill]                         = useState<string | undefined>()
  const [mobileSidebarOpen, setMobileSidebarOpen]     = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed]       = useState(true)
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
    setMobileSidebarOpen(false)
    navigate('/chat', { replace: true })
  }, [newConversation, navigate])

  const handleSelectConversation = useCallback(async (id: string) => {
    await selectConversation(id)
    setActiveCitationMsgId(null)
    setCitationsForPanel([])
    setMobileSidebarOpen(false)
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
  const isLoadingInitial = loading && messages.length === 0
  const isEmpty = messages.length === 0 && !streaming && !isLoadingInitial

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-screen overflow-hidden bg-background">

      {/* ── LEFT: Conversation sidebar ─────────────────────────────────────── */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        loading={loading && messages.length === 0}
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        collapsed={sidebarCollapsed}
      />

      {/* ── CENTER: Main chat column ───────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Single chat header — nav toggle · title · new · theme */}
        <header className="flex items-center gap-1 px-2.5 h-12 border-b border-border/60 bg-card/40 shrink-0">
          {/* Mobile: open conversation drawer */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Open conversations"
          >
            <MenuIcon className="w-[18px] h-[18px]" />
          </button>

          {/* Desktop: collapse/expand conversation panel */}
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            title={sidebarCollapsed ? 'Show conversations' : 'Hide conversations'}
            aria-label={sidebarCollapsed ? 'Show conversations' : 'Hide conversations'}
            className="hidden md:inline-flex p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {sidebarCollapsed
              ? <PanelLeftOpenIcon className="w-4 h-4" />
              : <PanelLeftCloseIcon className="w-4 h-4" />}
          </button>

          <span className="flex-1 min-w-0 text-[13px] font-medium text-foreground truncate px-1">
            {activeTitle ?? 'New conversation'}
          </span>

          <button
            onClick={handleNewConversation}
            title="New conversation"
            aria-label="New conversation"
            className="p-1.5 rounded-md text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors"
          >
            <PlusIcon className="w-[18px] h-[18px]" />
          </button>

          <button
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            aria-label="Toggle dark mode"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {dark ? <SunIcon className="w-[18px] h-[18px]" /> : <MoonIcon className="w-[18px] h-[18px]" />}
          </button>
        </header>

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
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background via-background to-muted/20">
          {isLoadingInitial ? (
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
          ) : isEmpty ? (
            /* Empty state — greeting with a centred composer */
            <EmptyState
              onSuggestion={handleSuggestion}
              composer={
                <ChatInput
                  variant="centered"
                  autoFocus
                  onSend={handleSend}
                  sending={sending}
                  complexityLevel={complexityLevel}
                  onComplexityChange={setComplexityLevel}
                  prefill={prefill}
                  onPrefillConsumed={handlePrefillConsumed}
                  onStop={stopStreaming}
                />
              }
            />
          ) : (
            /* Messages */
            <div className="max-w-3xl mx-auto px-4 pt-5 pb-4 space-y-4">
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

        {/* Bottom composer — only once a conversation is under way */}
        {!isEmpty && !isLoadingInitial && (
          <ChatInput
            variant="bar"
            onSend={handleSend}
            sending={sending}
            disabled={false}
            complexityLevel={complexityLevel}
            onComplexityChange={setComplexityLevel}
            prefill={prefill}
            onPrefillConsumed={handlePrefillConsumed}
            onStop={stopStreaming}
          />
        )}
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
