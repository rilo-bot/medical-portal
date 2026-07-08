import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SendIcon, SquareIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ComplexityLevel } from '@/types'

interface Props {
  onSend: (content: string) => void
  sending: boolean
  disabled?: boolean
  complexityLevel: ComplexityLevel
  onComplexityChange: (level: ComplexityLevel) => void
  prefill?: string
  onPrefillConsumed?: () => void
  onStop?: () => void
  /** 'bar' = pinned bottom composer; 'centered' = standalone card (empty state) */
  variant?: 'bar' | 'centered'
  autoFocus?: boolean
}

const COMPLEXITY_OPTIONS: { value: ComplexityLevel; label: string; hint: string }[] = [
  { value: 'consultant', label: 'Consultant', hint: 'Detailed clinical' },
  { value: 'gp', label: 'GP', hint: 'Balanced detail' },
  { value: 'student', label: 'Student', hint: 'Explained clearly' },
  { value: 'patient', label: 'Patient', hint: 'Plain language' },
]

export default function ChatInput({
  onSend,
  sending,
  disabled,
  complexityLevel,
  onComplexityChange,
  prefill,
  onPrefillConsumed,
  onStop,
  variant = 'bar',
  autoFocus = false,
}: Props) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Handle prefill from follow-up pills
  useEffect(() => {
    if (prefill) {
      setText(prefill)
      textareaRef.current?.focus()
      onPrefillConsumed?.()
    }
  }, [prefill, onPrefillConsumed])

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus()
  }, [autoFocus])

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    autoResize()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || sending || disabled) return
    onSend(trimmed)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const canSend = text.trim().length > 0 && !sending && !disabled
  const isCentered = variant === 'centered'

  return (
    <div
      className={cn(
        isCentered
          ? 'w-full'
          : 'border-t border-border bg-background/80 backdrop-blur-md px-4 pt-3 pb-3'
      )}
    >
      <div className={cn(isCentered ? '' : 'max-w-3xl mx-auto')}>
        {/* Unified composer card */}
        <div
          className={cn(
            'rounded-xl border bg-card transition-all',
            'focus-within:ring-2 focus-within:ring-brand/25 focus-within:border-brand/50',
            isCentered
              ? 'border-border shadow-lg shadow-brand/5'
              : 'border-border shadow-sm'
          )}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a clinical question…"
            rows={isCentered ? 2 : 1}
            disabled={disabled}
            className={cn(
              'w-full resize-none bg-transparent px-3.5 pt-3 pb-1 text-[13px] text-foreground',
              'placeholder:text-muted-foreground/50 focus:outline-none',
              'min-h-[42px] max-h-[176px] leading-relaxed',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{ height: 'auto' }}
          />

          {/* Footer: complexity pills + send */}
          <div className="flex items-end justify-between gap-2 px-2.5 pb-2.5 pt-1">
            <div className="flex items-center flex-wrap gap-1 min-w-0">
              <span className="text-[11px] text-muted-foreground/70 mr-1 hidden sm:inline">Explain&nbsp;as</span>
              {COMPLEXITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onComplexityChange(opt.value)}
                  title={opt.hint}
                  className={cn(
                    'text-[11px] px-2.5 py-1 rounded-full font-medium transition-all',
                    complexityLevel === opt.value
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Send / Stop button */}
            {sending ? (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={onStop}
                title="Stop generating"
                aria-label="Stop generating"
                className="shrink-0 p-2 rounded-xl transition-all bg-muted text-foreground hover:bg-muted/80"
              >
                <SquareIcon className="w-4 h-4 fill-current" />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={handleSend}
                disabled={!canSend}
                aria-label="Send message"
                className={cn(
                  'shrink-0 p-2 rounded-xl transition-all',
                  canSend
                    ? 'bg-brand text-white shadow-sm hover:bg-brand/90 hover:shadow-md'
                    : 'bg-muted text-muted-foreground/60 cursor-not-allowed'
                )}
              >
                <SendIcon className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
          Enter to send · Shift+Enter for new line · Always apply clinical judgement
        </p>
      </div>
    </div>
  )
}
