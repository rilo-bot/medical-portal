import { motion } from 'framer-motion'
import { PlusIcon, MessageSquareIcon, ClockIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/types'

interface Props {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  loading: boolean
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function ConversationSidebar({ conversations, activeId, onSelect, onNew, loading }: Props) {
  return (
    <aside className="flex flex-col w-[280px] shrink-0 border-r border-border bg-card/60 backdrop-blur-sm h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand/90 active:scale-[0.98] transition-all shadow-sm"
        >
          <PlusIcon className="w-4 h-4 shrink-0" />
          <span>New conversation</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {loading && conversations.length === 0 ? (
          <div className="flex flex-col gap-2 px-2 py-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageSquareIcon className="w-8 h-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">No conversations yet.<br />Start a new chat above.</p>
          </div>
        ) : (
          conversations.map((conv, i) => (
            <motion.button
              key={conv.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              onClick={() => onSelect(conv.id)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg transition-all group relative border-l-2',
                activeId === conv.id
                  ? 'bg-brand/10 border-brand'
                  : 'border-transparent hover:bg-muted/60 hover:border-brand/30'
              )}
            >
              <div className="flex items-start gap-2">
                <MessageSquareIcon className={cn(
                  'w-3.5 h-3.5 mt-0.5 shrink-0 transition-colors',
                  activeId === conv.id ? 'text-brand' : 'text-muted-foreground/50 group-hover:text-muted-foreground'
                )} />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium truncate leading-snug transition-colors',
                    activeId === conv.id ? 'text-brand' : 'text-foreground/80'
                  )}>
                    {conv.title}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <ClockIcon className="w-2.5 h-2.5 text-muted-foreground/50" />
                    <span className="text-[11px] text-muted-foreground/60">{timeAgo(conv.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-[11px] text-muted-foreground/50 text-center leading-snug">
          Conversations are private to your account
        </p>
      </div>
    </aside>
  )
}
