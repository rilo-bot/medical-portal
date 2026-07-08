import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText,
  Search,
  Loader2,
  ArrowLeft,
  Upload,
  MessageSquare,
  Download,
  UserPlus,
  Shield,
  Trash2,
  RefreshCw,
  Bookmark,
  Database,
} from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/ui/avatar'
import type { AuditEntry } from '@/types'

// ─── Action icon + colour map ─────────────────────────────────────────────────

function getActionMeta(action: string): {
  icon: React.ComponentType<{ className?: string }>
  label: string
  colour: string
} {
  if (action.startsWith('chat.query'))    return { icon: MessageSquare, label: 'Query',       colour: 'bg-brand/10 text-brand' }
  if (action.startsWith('chat.export'))   return { icon: Download,      label: 'Export',      colour: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300' }
  if (action.startsWith('chat.bookmark')) return { icon: Bookmark,      label: 'Bookmark',    colour: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300' }
  if (action.startsWith('document.upload'))  return { icon: Upload,   label: 'Upload',       colour: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300' }
  if (action.startsWith('document.delete'))  return { icon: Trash2,   label: 'Delete',       colour: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300' }
  if (action.startsWith('document.reindex')) return { icon: RefreshCw, label: 'Reindex',     colour: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300' }
  if (action.startsWith('collection'))       return { icon: Database,  label: 'Collection',  colour: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300' }
  if (action.startsWith('user.create'))      return { icon: UserPlus,  label: 'User Created', colour: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-300' }
  if (action.startsWith('user.role_change')) return { icon: Shield,    label: 'Role Change',  colour: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300' }
  return { icon: FileText, label: action, colour: 'bg-muted text-muted-foreground' }
}

// ─── Action filter options ────────────────────────────────────────────────────

const ACTION_FILTERS = [
  { value: '',                label: 'All Actions' },
  { value: 'chat',            label: 'Chat' },
  { value: 'document',        label: 'Documents' },
  { value: 'collection',      label: 'Collections' },
  { value: 'user',            label: 'Users' },
]

// ─── Audit row ────────────────────────────────────────────────────────────────

interface AuditRowProps {
  entry: AuditEntry
  index: number
  userName?: string
}

function AuditRow({ entry, index, userName }: AuditRowProps) {
  const { icon: Icon, label, colour } = getActionMeta(entry.action)
  const date = new Date(entry.createdAt)

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.3) }}
      className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors"
    >
      {/* Action */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md shrink-0 ${colour}`}>
            <Icon className="h-3 w-3" />
          </span>
          <span className="text-xs font-semibold text-foreground whitespace-nowrap">{label}</span>
        </div>
      </td>

      {/* Detail */}
      <td className="px-4 py-3 max-w-xs">
        <p className="text-xs text-muted-foreground truncate" title={entry.detail}>
          {entry.detail}
        </p>
      </td>

      {/* User */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <div className="flex items-center gap-2">
          <Avatar name={userName ?? entry.userId} className="h-5 w-5 text-[7px]" />
          <span className="text-xs text-muted-foreground truncate max-w-[100px]">
            {userName ?? entry.userId}
          </span>
        </div>
      </td>

      {/* Timestamp */}
      <td className="px-4 py-3 shrink-0">
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          <p>{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          <p className="text-[10px] opacity-70">{date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </td>
    </motion.tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditLog() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)

  const auditEntries = useAdminStore((s) => s.auditEntries)
  const users = useAdminStore((s) => s.users)
  const loadingAudit = useAdminStore((s) => s.loadingAudit)
  const loadAudit = useAdminStore((s) => s.loadAudit)
  const loadUsers = useAdminStore((s) => s.loadUsers)

  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      navigate('/chat', { replace: true })
      return
    }
    loadAudit()
    loadUsers()
  }, [currentUser, navigate, loadAudit, loadUsers])

  if (!currentUser || currentUser.role !== 'admin') return null

  // Build user name lookup
  const userMap = useMemo(() => {
    const map: Record<string, string> = {}
    users.forEach((u) => { map[u.id] = u.name })
    return map
  }, [users])

  const filteredEntries = auditEntries.filter((entry) => {
    const matchesAction = !actionFilter || entry.action.startsWith(actionFilter)
    const matchesSearch =
      !searchQuery ||
      entry.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (userMap[entry.userId] ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesAction && matchesSearch
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back nav */}
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/admin')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Admin Panel
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1.5">
          <div className="h-9 w-9 rounded-lg bg-brand/10 flex items-center justify-center">
            <FileText className="h-[18px] w-[18px] text-brand" />
          </div>
          <h1
            className="text-2xl font-semibold text-foreground"
            style={{ fontFamily: 'Source Serif 4, serif' }}
          >
            Audit Log
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          {auditEntries.length} event{auditEntries.length !== 1 ? 's' : ''} recorded — complete activity trail for compliance and review
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search events…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Action filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {ACTION_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActionFilter(f.value)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                actionFilter === f.value
                  ? 'bg-brand text-brand-foreground border-brand'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="flex items-center gap-4 mb-4 text-xs text-muted-foreground"
      >
        <span>{filteredEntries.length} result{filteredEntries.length !== 1 ? 's' : ''}</span>
        {(searchQuery || actionFilter) && (
          <button
            onClick={() => { setSearchQuery(''); setActionFilter('') }}
            className="text-brand hover:underline"
          >
            Clear filters
          </button>
        )}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
      >
        {loadingAudit && auditEntries.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-brand animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Detail
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      {searchQuery || actionFilter ? 'No events match your filters.' : 'No audit events found.'}
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry, i) => (
                    <AuditRow
                      key={entry.id}
                      entry={entry}
                      index={i}
                      userName={userMap[entry.userId]}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
