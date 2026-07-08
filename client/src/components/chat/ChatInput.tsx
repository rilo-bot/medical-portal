import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SendIcon, Loader2Icon } from 'lucide-react'
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

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3">
      {/* Complexity level selector */}
      <div className="flex items-center gap-1 mb-2">
        <span className="text-[11px] text-muted-foreground mr-1.5">Explain as:</span>
        {COMPLEXITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onComplexityChange(opt.value)}
            title={opt.hint}
            className={cn(
              'text-[11px] px-2.5 py-1 rounded-full font-medium transition-all',
              complexityLevel === opt.value
                ? 'bg-brand text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a clinical question…"
            rows={1}
            disabled={disabled}
            className={cn(
              'w-full resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground',
              'placeholder:text-muted-foreground/60',
              'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/60',
              'transition-all min-h-[44px] max-h-[180px] leading-relaxed',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{ height: 'auto' }}
          />
        </div>

        {/* Send button */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'shrink-0 p-2.5 rounded-xl transition-all mb-0.5',
            canSend
              ? 'bg-brand text-white shadow-sm hover:bg-brand/90 hover:shadow-md'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          {sending
            ? <Loader2Icon className="w-4 h-4 animate-spin" />
            : <SendIcon className="w-4 h-4" />}
        </motion.button>
      </div>

      <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
        Enter to send · Shift+Enter for new line · Always apply clinical judgement
      </p>
    </div>
  )
}
