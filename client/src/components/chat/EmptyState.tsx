import { motion } from 'framer-motion'
import { SparklesIcon, ShieldCheckIcon, BookOpenIcon, ZapIcon } from 'lucide-react'

interface Props {
  onSuggestion: (text: string) => void
}

const STARTER_QUESTIONS = [
  {
    emoji: '💊',
    q: 'What are the NICE guidelines for managing hypertension in adults over 80?',
    tag: 'Cardiology · NICE NG203',
  },
  {
    emoji: '🫁',
    q: 'What is the first-line antibiotic for community-acquired pneumonia in adults?',
    tag: 'Respiratory · Local protocol',
  },
  {
    emoji: '🩺',
    q: 'Summarise the DKA management protocol including fluid and insulin targets.',
    tag: 'Endocrinology · JBDS protocol',
  },
]

const PILLARS = [
  { icon: BookOpenIcon, label: 'KB-first RAG', desc: 'Your private knowledge base is searched before any general AI knowledge is used.' },
  { icon: ShieldCheckIcon, label: 'Cited answers', desc: 'Every response includes document, section and page number.' },
  { icon: ZapIcon, label: 'Confidence scored', desc: 'Each answer carries a confidence percentage and source count.' },
]

export default function EmptyState({ onSuggestion }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center flex-1 min-h-full px-6 py-10 text-center"
    >
      {/* Logo mark */}
      <div className="relative mb-5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.05 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand/20 to-brand-accent/20 flex items-center justify-center shadow-inner"
        >
          <SparklesIcon className="w-8 h-8 text-brand" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-2xl bg-brand-accent/10 blur-md -z-10"
        />
      </div>

      <h2
        className="text-2xl font-semibold text-foreground mb-2 tracking-tight"
        style={{ fontFamily: 'Source Serif 4, serif' }}
      >
        Clinical Assistant
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-8">
        Ask clinical questions grounded in your knowledge base. Every answer is cited, confidence-scored, and clearly labelled by source.
      </p>

      {/* Pillar strip */}
      <div className="flex items-stretch gap-3 mb-8 max-w-xl w-full">
        {PILLARS.map(({ icon: Icon, label, desc }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.06, duration: 0.3 }}
            className="flex-1 rounded-xl border border-border bg-card p-3 text-left"
          >
            <Icon className="w-4 h-4 text-brand mb-1.5" />
            <p className="text-xs font-semibold text-foreground mb-0.5">{label}</p>
            <p className="text-[11px] text-muted-foreground leading-snug">{desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Starter questions */}
      <div className="w-full max-w-xl space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Suggested questions
        </p>
        {STARTER_QUESTIONS.map(({ emoji, q, tag }, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 + i * 0.07, duration: 0.28 }}
            whileHover={{ y: -1 }}
            onClick={() => onSuggestion(q)}
            className="w-full text-left px-4 py-3.5 rounded-xl border border-border bg-card hover:border-brand/40 hover:bg-brand/5 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5 shrink-0">{emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground/80 group-hover:text-foreground leading-snug transition-colors">
                  {q}
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-1 font-medium">{tag}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground/40 mt-8 max-w-xs leading-snug">
        This tool supports clinical decision-making. Always apply professional judgement and consult colleagues when in doubt.
      </p>
    </motion.div>
  )
}
