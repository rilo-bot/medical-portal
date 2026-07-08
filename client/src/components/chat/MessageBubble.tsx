import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookmarkIcon,
  BookmarkCheckIcon,
  ChevronDownIcon,
  FileTextIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Message, Citation } from '@/types'
import ExportMenu from './ExportMenu'
import ConfidencePill from './ConfidencePill'

interface Props {
  message: Message
  onBookmark: (id: string, bookmarked: boolean) => void
  onSelectCitation: (citations: Citation[], messageId: string) => void
  activeCitationMessageId: string | null
  followUps?: string[]
  onFollowUp?: (text: string) => void
}

// ─── Simple markdown-lite renderer ────────────────────────────────────────────
function parseLine(text: string, key: number | string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return (
    <span key={key}>
      {parts.map((p, j) => {
        if (p.startsWith('**') && p.endsWith('**'))
          return <strong key={j} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>
        if (p.startsWith('`') && p.endsWith('`'))
          return <code key={j} className="px-1 py-0.5 rounded text-xs bg-muted font-mono">{p.slice(1, -1)}</code>
        return p
      })}
    </span>
  )
}

function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-2 border-brand/40 pl-3 text-muted-foreground italic text-sm my-2">
          {parseLine(line.slice(2), 'bq')}
        </blockquote>
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: React.ReactNode[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(<li key={i}>{parseLine(lines[i].slice(2), i)}</li>)
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-0.5 my-1.5 pl-1 text-sm">
          {items}
        </ul>
      )
      continue
    } else if (/^\d+\. /.test(line)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={i}>{parseLine(lines[i].replace(/^\d+\. /, ''), i)}</li>)
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-0.5 my-1.5 pl-1 text-sm">
          {items}
        </ol>
      )
      continue
    } else if (line === '') {
      elements.push(<div key={i} className="h-2" />)
    } else {
      elements.push(<p key={i} className="leading-relaxed text-sm">{parseLine(line, i)}</p>)
    }
    i++
  }
  return elements
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MessageBubble({
  message,
  onBookmark,
  onSelectCitation,
  activeCitationMessageId,
  followUps = [],
  onFollowUp,
}: Props) {
  const isUser = message.role === 'user'
  const isActive = activeCitationMessageId === message.id
  const [showCitations, setShowCitations] = useState(false)

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end"
      >
        <div className="max-w-[72%] px-4 py-3 rounded-2xl rounded-tr-sm bg-brand text-white shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </motion.div>
    )
  }

  // ─── Assistant message ─────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-2"
    >
      {/* Main bubble */}
      <div
        data-message-id={message.id}
        className={cn(
          'max-w-[72%] rounded-2xl rounded-tl-sm border border-border bg-card shadow-sm transition-all duration-200',
          isActive && 'shadow-md ring-1 ring-brand/20'
        )}
      >
        {/* Metadata strip */}
        <div className="flex items-center gap-2 px-4 pt-3.5 pb-1 flex-wrap">
          {message.confidence != null && (
            <ConfidencePill
              confidence={message.confidence}
              sourceCount={message.citations?.length}
            />
          )}
          {message.supplemental && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium"
            >
              <AlertTriangleIcon className="w-3 h-3" />
              AI supplemental
            </motion.span>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-2 text-foreground/90 space-y-0.5">
          {renderContent(message.content)}
        </div>

        {/* Citations toggle */}
        {message.citations && message.citations.length > 0 && (
          <div className="px-4 pb-2 pt-1">
            <button
              onClick={() => {
                setShowCitations((v) => !v)
                onSelectCitation(message.citations, message.id)
              }}
              className="inline-flex items-center gap-1.5 text-xs text-brand hover:text-brand/80 font-semibold transition-colors"
            >
              <FileTextIcon className="w-3.5 h-3.5" />
              {message.citations.length} citation{message.citations.length !== 1 ? 's' : ''}
              <ChevronDownIcon className={cn(
                'w-3 h-3 transition-transform duration-200',
                (showCitations || isActive) && 'rotate-180'
              )} />
            </button>
          </div>
        )}

        {/* Inline citations (accessible on mobile) */}
        <AnimatePresence>
          {showCitations && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mx-4 mb-3 rounded-xl border border-border overflow-hidden divide-y divide-border">
                {message.citations.map((c, idx) => (
                  <div key={idx} className="px-3 py-2.5 bg-muted/30">
                    <p className="text-xs font-semibold text-foreground">{c.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {[c.section, c.page != null ? `p. ${c.page}` : null].filter(Boolean).join(' · ')}
                    </p>
                    {c.snippet && (
                      <p className="text-[11px] text-muted-foreground/70 mt-1.5 italic leading-relaxed line-clamp-3">
                        "{c.snippet}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action bar */}
        <div className="flex items-center gap-0.5 px-3 pb-3 pt-1 border-t border-border/50 mt-1">
          {/* Bookmark */}
          <button
            onClick={() => onBookmark(message.id, !message.bookmarked)}
            title={message.bookmarked ? 'Remove bookmark' : 'Bookmark this answer'}
            className={cn(
              'p-1.5 rounded-lg transition-all',
              message.bookmarked
                ? 'text-brand bg-brand/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {message.bookmarked
              ? <BookmarkCheckIcon className="w-3.5 h-3.5" />
              : <BookmarkIcon className="w-3.5 h-3.5" />}
          </button>

          {/* Export */}
          <ExportMenu messageId={message.id} />

          {/* Open citations panel */}
          {message.citations && message.citations.length > 0 && (
            <button
              onClick={() => onSelectCitation(message.citations, message.id)}
              title="Open citations panel"
              className={cn(
                'p-1.5 rounded-lg transition-all',
                isActive
                  ? 'text-brand bg-brand/10'
                  : 'text-muted-foreground hover:text-brand hover:bg-brand/10'
              )}
            >
              <ExternalLinkIcon className="w-3.5 h-3.5" />
            </button>
          )}

          {/* KB badge */}
          <div className="ml-auto flex items-center gap-1">
            {!message.supplemental && message.confidence != null && (
              <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                <CheckCircle2Icon className="w-3 h-3 text-brand/40" />
                KB-sourced
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Follow-up suggestion pills */}
      {followUps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.25 }}
          className="flex flex-wrap gap-2 pl-1"
        >
          {followUps.map((q, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + idx * 0.07, duration: 0.2 }}
              whileHover={{ y: -1 }}
              onClick={() => onFollowUp?.(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-brand/25 text-brand bg-brand/5 hover:bg-brand/15 hover:border-brand/50 transition-all font-medium"
            >
              {q}
            </motion.button>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
