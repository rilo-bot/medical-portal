import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface Props {
  confidence: number   // 0–1
  sourceCount?: number
}

export default function ConfidencePill({ confidence, sourceCount }: Props) {
  const pct = Math.round(confidence * 100)
  const [visible, setVisible] = useState(false)

  // Animate from 0 → pct on mount
  const spring = useSpring(0, { stiffness: 80, damping: 18 })
  const displayed = useTransform(spring, (v) => Math.round(v))
  const [displayVal, setDisplayVal] = useState(0)

  useEffect(() => {
    setVisible(true)
    spring.set(pct)
    const unsub = displayed.on('change', (v) => setDisplayVal(v))
    return unsub
  }, [pct, spring, displayed])

  const colorClass =
    pct >= 85 ? 'text-brand bg-brand/10' :
    pct >= 65 ? 'text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/10' :
    'text-destructive bg-destructive/10'

  if (!visible) return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}
    >
      <motion.span
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="inline-block w-1.5 h-1.5 rounded-full bg-current"
      />
      {displayVal}% confidence
      {sourceCount != null && (
        <>
          <span className="opacity-30 mx-0.5">·</span>
          <span className="text-brand-accent font-bold">
            {sourceCount} {sourceCount === 1 ? 'source' : 'sources'}
          </span>
        </>
      )}
    </span>
  )
}
