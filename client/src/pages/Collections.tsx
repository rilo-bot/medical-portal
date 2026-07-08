import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Plus,
  Search,
  Loader2,
  ChevronRight,
  FileText,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { useCollectionsStore } from '@/stores/collectionsStore'
import { useDocumentsStore } from '@/stores/documentsStore'
import { useAuthStore } from '@/stores/authStore'
import type { Collection } from '@/types'

interface CollectionCardProps {
  collection: Collection
  docCount: number
  indexedCount: number
  index: number
  onClick: () => void
}

function CollectionCard({ collection, docCount, indexedCount, index, onClick }: CollectionCardProps) {
  const progress = docCount > 0 ? Math.round((indexedCount / docCount) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="group cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:border-brand/30 transition-all duration-200"
    >
      {/* Icon + name */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 shrink-0">
          <BookOpen className="h-5 w-5 text-brand" />
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-brand group-hover:translate-x-0.5 transition-all mt-1" />
      </div>

      <h3
        className="text-sm font-semibold text-foreground mb-1.5 group-hover:text-brand transition-colors"
        style={{ fontFamily: 'Source Serif 4, serif' }}
      >
        {collection.name}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
        {collection.description}
      </p>

      {/* Progress bar */}
      {docCount > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>{indexedCount}/{docCount} indexed</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: index * 0.06 + 0.3, duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full bg-brand"
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/60">
        <span className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {docCount} doc{docCount !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(collection.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </motion.div>
  )
}

// ─── New Collection Form (inline) ─────────────────────────────────────────────

interface NewCollectionFormProps {
  onSubmit: (name: string, description: string) => Promise<void>
  onCancel: () => void
  loading: boolean
}

function NewCollectionForm({ onSubmit, onCancel, loading }: NewCollectionFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await onSubmit(name.trim(), description.trim())
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-xl border border-brand/30 bg-card p-6 shadow-lg col-span-full"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Plus className="h-4 w-4 text-brand" />
        New Collection
      </h3>
      <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. NICE Guidelines"
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this collection"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="sm:col-span-2 flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-brand-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Create Collection
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Collections() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'

  const collections = useCollectionsStore((s) => s.collections)
  const loading = useCollectionsStore((s) => s.loading)
  const error = useCollectionsStore((s) => s.error)
  const loadCollections = useCollectionsStore((s) => s.load)
  const createCollection = useCollectionsStore((s) => s.create)

  const documents = useDocumentsStore((s) => s.documents)
  const loadDocuments = useDocumentsStore((s) => s.load)

  const [searchQuery, setSearchQuery] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadCollections()
    loadDocuments()
  }, [loadCollections, loadDocuments])

  async function handleCreate(name: string, description: string) {
    setFormLoading(true)
    try {
      await createCollection(name, description)
      setShowNewForm(false)
    } finally {
      setFormLoading(false)
    }
  }

  const filteredCollections = collections.filter(
    (c) =>
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-semibold text-foreground mb-1"
              style={{ fontFamily: 'Source Serif 4, serif' }}
            >
              Collections
            </h1>
            <p className="text-sm text-muted-foreground">
              {collections.length} collection{collections.length !== 1 ? 's' : ''} · Organise clinical documents by topic or specialty
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowNewForm((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand text-brand-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shrink-0"
            >
              <Plus className="h-4 w-4" />
              New Collection
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mt-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search collections…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* New collection form inline */}
        {showNewForm && (
          <NewCollectionForm
            onSubmit={handleCreate}
            onCancel={() => setShowNewForm(false)}
            loading={formLoading}
          />
        )}

        {loading && collections.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="h-14 w-14 rounded-xl bg-muted/50 flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                {searchQuery ? 'No collections match your search' : 'No collections yet'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? 'Create your first collection to start organising your knowledge base.' : 'No collections have been created yet.'}
              </p>
            </div>
          </div>
        ) : (
          filteredCollections.map((col, i) => {
            const colDocs = documents.filter((d) => d.collectionId === col.id)
            const indexedCount = colDocs.filter((d) => d.status === 'indexed').length
            return (
              <CollectionCard
                key={col.id}
                collection={col}
                docCount={colDocs.length}
                indexedCount={indexedCount}
                index={i}
                onClick={() => navigate('/knowledge-base')}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
