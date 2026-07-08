import { motion, AnimatePresence } from 'framer-motion'
import { XIcon, FileTextIcon, BookOpenIcon, HashIcon } from 'lucide-react'
import type { Citation } from '@/types'

interface Props {
  citations: Citation[]
  onClose: () => void
  isOpen: boolean
}

const sourceTypeIcon = (title: string) => {
  if (title.toLowerCase().includes('bnf') || title.toLowerCase().includes('formulary'))
    return '💊'
  if (title.toLowerCase().includes('nice') || title.toLowerCase().includes('guideline'))
    return '📋'
  if (title.toLowerCase().includes('protocol'))
    return '🏥'
  return '📄'
}

export default function CitationsPanel({ citations, onClose, isOpen }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="citations-panel"
          initial={{ x: 72, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 72, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-72 shrink-0 flex flex-col border-l border-border bg-card h-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4 text-brand" />
              <span className="text-sm font-semibold text-foreground">Citations</span>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand/10 text-brand text-[11px] font-bold">
                {citations.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Citation cards */}
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2.5">
            {citations.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="rounded-xl border border-border bg-background p-3.5 shadow-sm hover:shadow-md hover:border-brand/30 transition-all group"
              >
                {/* Source type & title */}
                <div className="flex items-start gap-2.5">
                  <span className="text-base mt-0.5 shrink-0">{sourceTypeIcon(c.title)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-snug group-hover:text-brand transition-colors">
                      {c.title}
                    </p>
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                      {c.section && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <FileTextIcon className="w-2.5 h-2.5" />
                          {c.section}
                        </span>
                      )}
                      {c.page != null && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <HashIcon className="w-2.5 h-2.5" />
                          p. {c.page}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Snippet */}
                {c.snippet && (
                  <div className="mt-2.5 pt-2.5 border-t border-border/60">
                    <p className="text-[11px] text-muted-foreground italic leading-relaxed line-clamp-4">
                      "{c.snippet}"
                    </p>
                  </div>
                )}

                {/* Citation number badge */}
                <div className="mt-2 flex justify-end">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                    [{i + 1}]
                  </span>
                </div>
              </motion.div>
            ))}

            {citations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BookOpenIcon className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No citations for this message.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2.5 border-t border-border bg-muted/30">
            <p className="text-[10px] text-muted-foreground/50 leading-snug text-center">
              Sources retrieved from your private knowledge base
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
