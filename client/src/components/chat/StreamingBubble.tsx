import { motion } from 'framer-motion'

interface Props {
  content: string
}

export default function StreamingBubble({ content }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-1 max-w-[92%] md:max-w-[78%]"
    >
      <div className="rounded-xl rounded-tl-sm border border-brand/20 bg-card shadow-sm px-4 py-3">
        {/* Streaming indicator */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[11px] text-brand font-medium tracking-wide">Searching knowledge base…</span>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="inline-block w-1.5 h-1.5 rounded-full bg-brand-accent"
          />
        </div>

        {/* Streamed text */}
        {content ? (
          <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {content}
            <motion.span
              animate={{ opacity: [1, 1, 0, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, ease: 'linear', times: [0, 0.5, 0.5, 1] }}
              className="inline-block ml-0.5 w-0.5 h-4 bg-brand-accent align-text-bottom rounded-sm"
              style={{
                boxShadow: '0 0 8px hsl(var(--brand-accent) / 0.6)',
              }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 py-1">
            {[0, 0.15, 0.3].map((delay, i) => (
              <motion.span
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 0.9, delay }}
                className="inline-block w-2 h-2 rounded-full bg-brand/40"
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
