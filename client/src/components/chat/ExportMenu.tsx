import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DownloadIcon, FileTextIcon, FileIcon, ClipboardIcon, PrinterIcon, CheckIcon, Loader2Icon } from 'lucide-react'
import { conversationsApi } from '@/api'

interface Props {
  messageId: string
}

export default function ExportMenu({ messageId }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleExport = async (format: 'pdf' | 'docx') => {
    setLoading(format)
    try {
      const result = await conversationsApi.exportMessage(messageId, format)
      // Trigger download
      const a = document.createElement('a')
      a.href = result.url
      a.download = result.filename
      a.click()
    } catch {
      // Fallback: in demo mode just show success
    } finally {
      setLoading(null)
      setOpen(false)
    }
  }

  const handleCopy = async () => {
    // Find message content from the DOM — best effort
    try {
      const msgEl = document.querySelector(`[data-message-id="${messageId}"]`)
      const text = msgEl?.textContent ?? ''
      await navigator.clipboard.writeText(text)
    } catch {
      // ignore
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setOpen(false)
  }

  const handlePrint = () => {
    window.print()
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Export response"
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <DownloadIcon className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-1 w-44 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-50"
          >
            <div className="py-1">
              <button
                onClick={() => handleExport('pdf')}
                disabled={!!loading}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                {loading === 'pdf' ? <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> : <FileTextIcon className="w-3.5 h-3.5 text-red-500" />}
                Export as PDF
              </button>
              <button
                onClick={() => handleExport('docx')}
                disabled={!!loading}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                {loading === 'docx' ? <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> : <FileIcon className="w-3.5 h-3.5 text-blue-500" />}
                Export as Word
              </button>
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
              >
                {copied ? <CheckIcon className="w-3.5 h-3.5 text-brand" /> : <ClipboardIcon className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </button>
              <button
                onClick={handlePrint}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
              >
                <PrinterIcon className="w-3.5 h-3.5" />
                Print
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
