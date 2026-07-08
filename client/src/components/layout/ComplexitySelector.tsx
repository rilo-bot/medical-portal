import { motion } from 'framer-motion'
import type { ComplexityLevel } from '@/types'

interface ComplexityOption {
  value: ComplexityLevel
  label: string
  short: string
}

const OPTIONS: ComplexityOption[] = [
  { value: 'consultant', label: 'Consultant', short: 'Cons.' },
  { value: 'gp', label: 'GP', short: 'GP' },
  { value: 'student', label: 'Student', short: 'Stud.' },
  { value: 'patient', label: 'Patient', short: 'Pat.' },
]

interface ComplexitySelectorProps {
  value: ComplexityLevel
  onChange: (level: ComplexityLevel) => void
}

export default function ComplexitySelector({ value, onChange }: ComplexitySelectorProps) {
  return (
    <div
      role="group"
      aria-label="Answer complexity level"
      className="flex items-center gap-0.5 bg-muted rounded-full px-1 py-1 border border-border"
    >
      {OPTIONS.map((opt) => {
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className="relative px-3 py-1 rounded-full text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isActive && (
              <motion.span
                layoutId="complexityPill"
                className="absolute inset-0 bg-brand rounded-full shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors ${
                isActive ? 'text-brand-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {/* Full label on medium+, short on small */}
              <span className="hidden sm:inline">{opt.label}</span>
              <span className="sm:hidden">{opt.short}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
