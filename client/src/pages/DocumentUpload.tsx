import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Link as LinkIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  ArrowLeft,
  Globe,
  FilePlus,
} from 'lucide-react'
import { useCollectionsStore } from '@/stores/collectionsStore'
import { useDocumentsStore } from '@/stores/documentsStore'
import { useAuthStore } from '@/stores/authStore'

type UploadTab = 'file' | 'url'

interface UploadQueueItem {
  id: string
  name: string
  size: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
  duplicate?: boolean
}

const ACCEPTED_TYPES = ['.pdf', '.docx', '.doc', '.txt', '.html', '.htm']
const MAX_SIZE_MB = 50

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileQueueItem({ item, onRemove }: { item: UploadQueueItem; onRemove: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card"
    >
      <div className="shrink-0 h-8 w-8 rounded-md bg-brand/10 flex items-center justify-center">
        <FileText className="h-4 w-4 text-brand" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(item.size)}</p>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        {item.status === 'pending' && (
          <span className="text-xs text-muted-foreground">Ready</span>
        )}
        {item.status === 'uploading' && (
          <Loader2 className="h-4 w-4 text-brand animate-spin" />
        )}
        {item.status === 'done' && (
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            {item.duplicate && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border status-warning">
                Duplicate
              </span>
            )}
          </div>
        )}
        {item.status === 'error' && (
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-xs text-destructive max-w-[140px] truncate">{item.error}</span>
          </div>
        )}
        {item.status === 'pending' && (
          <button
            onClick={() => onRemove(item.id)}
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function DocumentUpload() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'

  const collections = useCollectionsStore((s) => s.collections)
  const loadCollections = useCollectionsStore((s) => s.load)
  const upload = useDocumentsStore((s) => s.upload)
  const ingestUrl = useDocumentsStore((s) => s.ingestUrl)
  const documentsError = useDocumentsStore((s) => s.error)

  const [activeTab, setActiveTab] = useState<UploadTab>('file')
  const [selectedCollection, setSelectedCollection] = useState('')
  const [queue, setQueue] = useState<UploadQueueItem[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [urlStatus, setUrlStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [urlError, setUrlError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadCollections()
    if (!isAdmin) navigate('/knowledge-base', { replace: true })
  }, [loadCollections, isAdmin, navigate])

  // Auto-select first collection
  useEffect(() => {
    if (collections.length > 0 && !selectedCollection) {
      setSelectedCollection(collections[0].id)
    }
  }, [collections, selectedCollection])

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files)
    const newItems: UploadQueueItem[] = arr
      .filter((f) => {
        const ext = '.' + f.name.split('.').pop()?.toLowerCase()
        return ACCEPTED_TYPES.includes(ext) && f.size <= MAX_SIZE_MB * 1024 * 1024
      })
      .map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        name: f.name,
        size: f.size,
        status: 'pending' as const,
        _file: f,
      })) as unknown as UploadQueueItem[]
    setQueue((q) => [...q, ...newItems])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ''
  }, [addFiles])

  const removeFromQueue = useCallback((id: string) => {
    setQueue((q) => q.filter((item) => item.id !== id))
  }, [])

  const handleUploadAll = useCallback(async () => {
    if (!selectedCollection || queue.filter((i) => i.status === 'pending').length === 0) return
    setIsUploading(true)

    const pending = queue.filter((i) => i.status === 'pending')
    for (const item of pending) {
      setQueue((q) => q.map((i) => i.id === item.id ? { ...i, status: 'uploading' } : i))
      try {
        // We stored the file reference in _file (cast around the type)
        const file = (item as unknown as { _file: File })._file
        const result = await upload(file, selectedCollection)
        setQueue((q) =>
          q.map((i) =>
            i.id === item.id ? { ...i, status: 'done', duplicate: result.duplicate } : i
          )
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setQueue((q) => q.map((i) => i.id === item.id ? { ...i, status: 'error', error: msg } : i))
      }
    }
    setIsUploading(false)
  }, [queue, selectedCollection, upload])

  const handleIngestUrl = useCallback(async () => {
    if (!urlInput.trim() || !selectedCollection) return
    setUrlStatus('loading')
    setUrlError('')
    try {
      await ingestUrl(urlInput.trim(), selectedCollection)
      setUrlStatus('done')
      setUrlInput('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to ingest URL'
      setUrlStatus('error')
      setUrlError(msg)
    }
  }, [urlInput, selectedCollection, ingestUrl])

  const allDone = queue.length > 0 && queue.every((i) => i.status === 'done' || i.status === 'error')
  const pendingCount = queue.filter((i) => i.status === 'pending').length

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back nav */}
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/knowledge-base')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Knowledge Base
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <FilePlus className="h-5 w-5 text-brand" />
          </div>
          <h1
            className="text-2xl font-semibold text-foreground"
            style={{ fontFamily: 'Source Serif 4, serif' }}
          >
            Add to Knowledge Base
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-13">
          Upload clinical documents or index web pages. Documents are auto-extracted, deduped, versioned and indexed for retrieval.
        </p>
      </motion.div>

      {/* Collection selector */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Target Collection *
        </label>
        <select
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="" disabled>Select a collection…</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </motion.div>

      {/* Tab selector */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-1 p-1 bg-muted rounded-lg mb-6"
      >
        {[
          { id: 'file' as const, label: 'Upload Files', icon: Upload },
          { id: 'url' as const, label: 'Add URL', icon: Globe },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={[
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'file' ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={[
                'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-all duration-200',
                isDragging
                  ? 'border-brand bg-brand/5 scale-[1.01]'
                  : 'border-border hover:border-brand/50 hover:bg-muted/20',
              ].join(' ')}
            >
              <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  Drop files here, or <span className="text-brand">browse</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, Word (.docx), TXT, HTML — up to {MAX_SIZE_MB} MB each
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_TYPES.join(',')}
                onChange={handleFileChange}
                className="sr-only"
              />
            </div>

            {/* Queue */}
            <AnimatePresence>
              {queue.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {queue.length} file{queue.length !== 1 ? 's' : ''} queued
                    </p>
                    {!isUploading && !allDone && (
                      <button
                        onClick={() => setQueue([])}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  {queue.map((item) => (
                    <FileQueueItem key={item.id} item={item} onRemove={removeFromQueue} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload button */}
            {queue.length > 0 && !allDone && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <button
                  onClick={handleUploadAll}
                  disabled={isUploading || !selectedCollection || pendingCount === 0}
                  className="w-full flex items-center justify-center gap-2 bg-brand text-brand-foreground py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload {pendingCount} file{pendingCount !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {allDone && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex gap-2"
              >
                <button
                  onClick={() => navigate('/knowledge-base')}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand text-brand-foreground py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <CheckCircle className="h-4 w-4" />
                  View Knowledge Base
                </button>
                <button
                  onClick={() => setQueue([])}
                  className="px-4 py-3 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Upload more
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="url"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <LinkIcon className="h-4 w-4 text-brand" />
                <h3 className="text-sm font-semibold text-foreground">Index a Web Page</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Paste a URL to a clinical guideline, journal article, or NHS page. The content will be extracted, chunked and indexed into your knowledge base.
              </p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => { setUrlInput(e.target.value); setUrlStatus('idle') }}
                    placeholder="https://www.nice.org.uk/guidance/ng203"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <button
                  onClick={handleIngestUrl}
                  disabled={urlStatus === 'loading' || !urlInput.trim() || !selectedCollection}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-brand text-brand-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {urlStatus === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Index
                </button>
              </div>

              <AnimatePresence>
                {urlStatus === 'done' && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 flex items-center gap-2 rounded-lg border status-success px-3 py-2 text-sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    URL queued for indexing — it will appear in the knowledge base shortly.
                  </motion.div>
                )}
                {urlStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {urlError || 'Failed to ingest URL. Please check the address and try again.'}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accepted formats */}
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Supported formats</p>
              <div className="flex flex-wrap gap-1.5">
                {['PDF', 'DOCX', 'DOC', 'TXT', 'HTML', 'Web URL'].map((fmt) => (
                  <span
                    key={fmt}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-brand/10 text-brand border border-brand/20"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global error */}
      <AnimatePresence>
        {documentsError && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
            {documentsError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
