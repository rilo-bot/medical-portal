import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Database,
  Plus,
  Upload,
  Link as LinkIcon,
  Search,
  FileText,
  Globe,
  AlertCircle,
  Loader2,
  ChevronRight,
  BookOpen,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { useCollectionsStore } from '@/stores/collectionsStore'
import { useDocumentsStore } from '@/stores/documentsStore'
import { useAuthStore } from '@/stores/authStore'
import type { Collection, KBDocument } from '@/types'

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: KBDocument['status'] }) {
  if (status === 'indexed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-2.5 h-2.5" />
        Indexed
      </span>
    )
  }
  if (status === 'processing') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-2.5 h-2.5 animate-spin" />
        Processing
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200">
      <XCircle className="w-2.5 h-2.5" />
      Failed
    </span>
  )
}

// ─── Source icon ─────────────────────────────────────────────────────────────

function SourceIcon({ type }: { type: string }) {
  const base = 'h-3.5 w-3.5 shrink-0'
  if (type === 'url') return <Globe className={`${base} text-brand`} />
  return <FileText className={`${base} text-muted-foreground`} />
}

// ─── Collection card ─────────────────────────────────────────────────────────

interface CollectionCardProps {
  collection: Collection
  documents: KBDocument[]
  isActive: boolean
  onClick: () => void
}

function CollectionCard({ collection, documents, isActive, onClick }: CollectionCardProps) {
  const colDocs = documents.filter((d) => d.collectionId === collection.id)
  const indexed = colDocs.filter((d) => d.status === 'indexed').length
  const processing = colDocs.filter((d) => d.status === 'processing').length

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={[
        'w-full text-left rounded-xl border p-5 transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'border-brand bg-brand/5 shadow-sm shadow-brand/10'
          : 'border-border bg-card hover:border-brand/30 hover:shadow-sm',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10">
          <BookOpen className="h-4.5 w-4.5 text-brand h-[18px] w-[18px]" />
        </div>
        {isActive && (
          <span className="text-[10px] font-semibold px-2 py-0.5 bg-brand text-brand-foreground rounded-full">
            Active
          </span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-foreground leading-snug mb-1">{collection.name}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
        {collection.description}
      </p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-emerald-500" />
          {indexed} indexed
        </span>
        {processing > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" />
            {processing} processing
          </span>
        )}
        <span className="ml-auto text-[10px] font-medium text-brand flex items-center gap-0.5">
          View <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </motion.button>
  )
}

// ─── Document row ─────────────────────────────────────────────────────────────

interface DocumentRowProps {
  doc: KBDocument
  isAdmin: boolean
  onReindex: () => void
  onRemove: () => void
}

function DocumentRow({ doc, isAdmin, onReindex, onRemove }: DocumentRowProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function handleRemoveClick() {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    setConfirmingDelete(false)
    onRemove()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors group"
    >
      <SourceIcon type={doc.sourceType} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
        <p className="text-xs text-muted-foreground">
          v{doc.version}
          {doc.pageCount ? ` · ${doc.pageCount} pages` : ''}
          {' · '}
          {new Date(doc.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
      <StatusBadge status={doc.status} />
      {isAdmin && (
        <div className="flex items-center gap-0.5 shrink-0">
          {(doc.status === 'failed' || doc.status === 'indexed') && (
            <button
              onClick={onReindex}
              title={doc.status === 'failed' ? 'Retry indexing' : 'Reindex'}
              className="p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-brand hover:bg-brand/10 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={handleRemoveClick}
            onBlur={() => setConfirmingDelete(false)}
            title={confirmingDelete ? 'Click again to confirm delete' : 'Delete document'}
            className={[
              'p-1.5 rounded-lg transition-all',
              confirmingDelete
                ? 'text-red-600 bg-red-50 opacity-100'
                : 'text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50',
            ].join(' ')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ─── New collection dialog ────────────────────────────────────────────────────

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
      className="rounded-xl border border-brand/30 bg-card p-5 shadow-lg"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">New Collection</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cardiology References"
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
            placeholder="Brief description of what this collection contains"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex-1 flex items-center justify-center gap-2 bg-brand text-brand-foreground text-sm font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create
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

export default function KnowledgeBase() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'

  const collections = useCollectionsStore((s) => s.collections)
  const collectionsLoading = useCollectionsStore((s) => s.loading)
  const collectionsError = useCollectionsStore((s) => s.error)
  const loadCollections = useCollectionsStore((s) => s.load)
  const createCollection = useCollectionsStore((s) => s.create)

  const documents = useDocumentsStore((s) => s.documents)
  const documentsLoading = useDocumentsStore((s) => s.loading)
  const loadDocuments = useDocumentsStore((s) => s.load)
  const reindexDocument = useDocumentsStore((s) => s.reindex)
  const removeDocument = useDocumentsStore((s) => s.remove)

  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadCollections()
    loadDocuments()
  }, [loadCollections, loadDocuments])

  // Auto-select first collection
  useEffect(() => {
    if (collections.length > 0 && !activeCollectionId) {
      setActiveCollectionId(collections[0].id)
    }
  }, [collections, activeCollectionId])

  const handleSelectCollection = useCallback((id: string) => {
    setActiveCollectionId(id)
    setSearchQuery('')
  }, [])

  const handleCreateCollection = useCallback(async (name: string, description: string) => {
    setFormLoading(true)
    try {
      const col = await createCollection(name, description)
      setActiveCollectionId(col.id)
      setShowNewForm(false)
    } finally {
      setFormLoading(false)
    }
  }, [createCollection])

  const activeCollection = collections.find((c) => c.id === activeCollectionId) ?? null

  const filteredDocuments = documents
    .filter((d) => d.collectionId === activeCollectionId)
    .filter((d) =>
      searchQuery ? d.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
    )

  const filteredCollections = collections.filter((c) =>
    searchQuery
      ? c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  )

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-background">

      {/* ── Left: Collections panel ─────────────────────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col border-r border-border bg-card/50 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-brand" />
              <h2 className="text-sm font-semibold text-foreground">Collections</h2>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-brand/10 text-brand rounded-full">
                {collections.length}
              </span>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowNewForm((v) => !v)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors"
                title="New collection"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search collections…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* New collection form */}
        {showNewForm && (
          <div className="p-3 border-b border-border">
            <NewCollectionForm
              onSubmit={handleCreateCollection}
              onCancel={() => setShowNewForm(false)}
              loading={formLoading}
            />
          </div>
        )}

        {/* Error */}
        {collectionsError && (
          <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {collectionsError}
          </div>
        )}

        {/* Collections list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {collectionsLoading && collections.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 text-brand animate-spin" />
            </div>
          ) : filteredCollections.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              {searchQuery ? 'No collections match your search.' : 'No collections yet.'}
            </p>
          ) : (
            filteredCollections.map((col, i) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <CollectionCard
                  collection={col}
                  documents={documents}
                  isActive={col.id === activeCollectionId}
                  onClick={() => handleSelectCollection(col.id)}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* ── Right: Documents panel ──────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Documents header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border shrink-0 bg-card/30">
          <div>
            {activeCollection ? (
              <>
                <h1
                  className="text-lg font-semibold text-foreground"
                  style={{ fontFamily: 'Source Serif 4, serif' }}
                >
                  {activeCollection.name}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                  {activeCollection.description}
                </p>
              </>
            ) : (
              <h1
                className="text-lg font-semibold text-foreground"
                style={{ fontFamily: 'Source Serif 4, serif' }}
              >
                Select a collection
              </h1>
            )}
          </div>

          {isAdmin && activeCollection && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/knowledge-base/upload')}
                className="flex items-center gap-1.5 px-3 py-2 bg-brand text-brand-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload
              </button>
              <button
                onClick={() => navigate('/knowledge-base/upload')}
                className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card text-xs font-medium text-muted-foreground rounded-lg hover:text-foreground hover:bg-muted transition-colors"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                Add URL
              </button>
            </div>
          )}
        </div>

        {/* Document search */}
        {activeCollection && (
          <div className="px-6 py-3 border-b border-border shrink-0">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="search"
                placeholder={`Search in ${activeCollection.name}…`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}

        {/* Documents list */}
        <div className="flex-1 overflow-y-auto">
          {!activeCollection ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center">
                <Database className="h-6 w-6 text-brand/60" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">No collection selected</p>
                <p className="text-xs text-muted-foreground">
                  Choose a collection from the left panel to view its documents.
                </p>
              </div>
            </div>
          ) : documentsLoading && filteredDocuments.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-brand animate-spin" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <div className="h-14 w-14 rounded-xl bg-muted/50 flex items-center justify-center">
                <FileText className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {searchQuery ? 'No documents match your search' : 'No documents yet'}
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  {searchQuery
                    ? 'Try a different search term.'
                    : isAdmin
                    ? 'Upload PDFs, Word documents, text files, or add URLs to get started.'
                    : 'No documents have been added to this collection yet.'}
                </p>
              </div>
              {isAdmin && !searchQuery && (
                <button
                  onClick={() => navigate('/knowledge-base/upload')}
                  className="flex items-center gap-2 px-4 py-2 bg-brand text-brand-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Upload className="h-4 w-4" />
                  Upload first document
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {/* Stats row */}
              <div className="flex items-center gap-6 px-6 py-3 bg-muted/20 text-xs text-muted-foreground">
                <span>{filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  {filteredDocuments.filter((d) => d.status === 'indexed').length} indexed
                </span>
                {filteredDocuments.some((d) => d.status === 'processing') && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {filteredDocuments.filter((d) => d.status === 'processing').length} processing
                  </span>
                )}
              </div>

              {/* Document rows */}
              <div>
                {filteredDocuments.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    isAdmin={isAdmin}
                    onReindex={() => reindexDocument(doc.id)}
                    onRemove={() => removeDocument(doc.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
