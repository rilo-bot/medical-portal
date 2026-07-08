import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bookmark,
  Search,
  MessageSquare,
  ExternalLink,
  FileText,
  Download,
  Copy,
  Loader2,
  BookOpen,
} from 'lucide-react'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import type { BookmarkedMessage, Citation } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function confidenceColor(score: number): string {
  if (score >= 0.9) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (score >= 0.75) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-red-50 text-red-600 border-red-200'
}

function truncate(text: string, maxLen = 280): string {
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + '…' : text
}

// Strip markdown for preview
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/^#+\s/gm, '')
    .replace(/^[-*]\s/gm, '')
    .replace(/\n{2,}/g, ' ')
    .trim()
}

// ─── Citation chips ───────────────────────────────────────────────────────────

function CitationChips({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {citations.slice(0, 3).map((c, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-brand/8 text-brand border border-brand/20"
          style={{ backgroundColor: 'hsl(var(--brand) / 0.08)' }}
        >
          <BookOpen className="w-2.5 h-2.5" />
          {c.title.length > 30 ? c.title.slice(0, 30) + '…' : c.title}
          {c.page && <span className="opacity-60">p.{c.page}</span>}
        </span>
      ))}
      {citations.length > 3 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground">
          +{citations.length - 3} more
        </span>
      )}
    </div>
  )
}

// ─── Saved answer card ────────────────────────────────────────────────────────

interface SavedCardProps {
  message: BookmarkedMessage
  onGoToChat: () => void
  onCopy: (content: string) => void
  onUnbookmark: (id: string) => void
  index: number
}

function SavedCard({ message, onGoToChat, onCopy, onUnbookmark, index }: SavedCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(message.content).catch(() => null)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="group rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:border-brand/20 transition-all duration-200"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare className="h-3.5 w-3.5 text-brand shrink-0" />
          <span className="text-xs font-medium text-muted-foreground truncate">
            {message.conversationTitle}
          </span>
          {message.complexityLevel && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded-full capitalize">
              {message.complexityLevel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {message.confidence !== null && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${confidenceColor(message.confidence)}`}>
              {Math.round(message.confidence * 100)}%
            </span>
          )}
          <button
            onClick={() => onUnbookmark(message.id)}
            className="p-1 rounded-md text-brand hover:text-brand/60 hover:bg-brand/10 transition-colors"
            title="Remove bookmark"
          >
            <Bookmark className="h-3.5 w-3.5 fill-current" />
          </button>
        </div>
      </div>

      {/* Content preview */}
      <p className="text-sm text-foreground leading-relaxed mb-3">
        {truncate(stripMarkdown(message.content))}
      </p>

      {/* Citations */}
      <CitationChips citations={message.citations} />

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
        <p className="text-[10px] text-muted-foreground">
          {new Date(message.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {copied ? <Download className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={onGoToChat}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            View in chat
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SavedAnswers() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const savedMessages = useChatStore((s) => s.savedMessages)
  const loadSavedMessages = useChatStore((s) => s.loadSavedMessages)
  const selectConversation = useChatStore((s) => s.selectConversation)
  const bookmarkMessage = useChatStore((s) => s.bookmarkMessage)
  const loading = useChatStore((s) => s.loadingSaved)

  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user) loadSavedMessages()
  }, [user, loadSavedMessages])

  const allMessages = savedMessages

  const filteredMessages = allMessages.filter(
    (m) =>
      !searchQuery ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.citations.some((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  function handleGoToChat(conversationId: string) {
    navigate('/chat')
    selectConversation(conversationId)
  }

  async function handleUnbookmark(id: string) {
    await bookmarkMessage(id, false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1.5">
          <div className="h-9 w-9 rounded-lg bg-brand/10 flex items-center justify-center">
            <Bookmark className="h-[18px] w-[18px] text-brand" />
          </div>
          <h1
            className="text-2xl font-semibold text-foreground"
            style={{ fontFamily: 'Source Serif 4, serif' }}
          >
            Saved Answers
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          {allMessages.length} bookmarked answer{allMessages.length !== 1 ? 's' : ''} — export to PDF, Word, or copy with citations
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="relative mb-6"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search saved answers…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </motion.div>

      {/* Content */}
      {loading && allMessages.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-brand animate-spin" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 gap-4 text-center"
        >
          <div className="h-14 w-14 rounded-xl bg-muted/50 flex items-center justify-center">
            <Bookmark className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              {searchQuery ? 'No saved answers match your search' : 'No saved answers yet'}
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {searchQuery
                ? 'Try a different search term.'
                : 'Bookmark answers in the chat by clicking the bookmark icon on any response.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={() => navigate('/chat')}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-brand-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              <MessageSquare className="h-4 w-4" />
              Go to Chat
            </button>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {filteredMessages.map((msg, i) => (
              <SavedCard
                key={msg.id}
                message={msg}
                onGoToChat={() => handleGoToChat(msg.conversationId)}
                onCopy={(content) => navigator.clipboard.writeText(content).catch(() => null)}
                onUnbookmark={handleUnbookmark}
                index={i}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Export all (if there are saved answers) */}
      {filteredMessages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-center justify-end gap-2"
        >
          <span className="text-xs text-muted-foreground mr-2">Export all</span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <FileText className="h-3.5 w-3.5" />
            PDF
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5" />
            Word
          </button>
        </motion.div>
      )}
    </div>
  )
}
