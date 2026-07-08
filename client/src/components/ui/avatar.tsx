import { cn } from '@/lib/utils'

// Deterministic, locally-rendered avatar — no third-party service, no PII (name/email) ever
// leaves the browser just to fetch a picture.

const PALETTE = [
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700',
  'bg-fuchsia-100 text-fuchsia-700',
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface AvatarProps {
  name: string
  className?: string
}

export function Avatar({ name, className }: AvatarProps) {
  const colorClass = PALETTE[hashString(name) % PALETTE.length]
  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        'flex items-center justify-center rounded-full font-semibold shrink-0 select-none text-[10px] leading-none',
        colorClass,
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
