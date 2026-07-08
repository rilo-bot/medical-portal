import { motion } from 'framer-motion'
import { SparklesIcon, ShieldCheckIcon, BookOpenIcon, ZapIcon } from 'lucide-react'

interface Props {
  onSuggestion: (text: string) => void
  /** The composer (ChatInput) rendered in the centre of the empty state */
  composer?: React.ReactNode
}

const STARTER_QUESTIONS = [
  { emoji: '💊', q: 'NICE guidelines for managing hypertension in adults over 80?' },
  { emoji: '🫁', q: 'First-line antibiotic for community-acquired pneumonia in adults?' },
  { emoji: '🩺', q: 'Summarise the DKA management protocol — fluids and insulin targets.' },
]

const TRUST = [
  { icon: BookOpenIcon, label: 'KB-first retrieval' },
  { icon: ShieldCheckIcon, label: 'Cited answers' },
  { icon: ZapIcon, label: 'Confidence scored' },
]

export default function EmptyState({ onSuggestion, composer }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl flex flex-col items-center text-center"
      >
        {/* Logo mark */}
        <div className="relative mb-3.5">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.05 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand/25 to-brand-accent/20 flex items-center justify-center shadow-inner"
          >
            <SparklesIcon className="w-5 h-5 text-brand" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-xl bg-brand-accent/10 blur-md -z-10"
          />
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-1.5 tracking-tight">
          How can I help?
        </h2>
        <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed mb-5">
          Ask a clinical question grounded in your knowledge base — every answer is cited and
          confidence-scored.
        </p>

        {/* Composer */}
        {composer && <div className="w-full mb-4">{composer}</div>}

        {/* Suggestion chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5">
          {STARTER_QUESTIONS.map(({ emoji, q }, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.07, duration: 0.28 }}
              whileHover={{ y: -1 }}
              onClick={() => onSuggestion(q)}
              className="group flex items-center gap-1.5 text-left text-[11.5px] px-3 py-1.5 rounded-lg border border-border bg-card/60 hover:border-brand/40 hover:bg-brand/5 transition-all max-w-full"
            >
              <span className="shrink-0 text-xs">{emoji}</span>
              <span className="text-foreground/70 group-hover:text-foreground transition-colors line-clamp-1">
                {q}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10.5px] text-muted-foreground/60">
          {TRUST.map(({ icon: Icon, label }, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <Icon className="w-3 h-3 text-brand/60" />
              {label}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
