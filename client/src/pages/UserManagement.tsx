import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Plus,
  Search,
  Shield,
  Stethoscope,
  Loader2,
  AlertCircle,
  X,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react'
import { useAdminStore } from '@/stores/adminStore'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/ui/avatar'
import type { Role, AdminUser } from '@/types'

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: Role }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand/10 text-brand border border-brand/20">
        <Shield className="w-2.5 h-2.5" />
        Administrator
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-secondary-foreground border border-border">
      <Stethoscope className="w-2.5 h-2.5" />
      Doctor
    </span>
  )
}

// ─── User row ─────────────────────────────────────────────────────────────────

interface UserRowProps {
  user: AdminUser
  index: number
  isSelf: boolean
  onRoleChange: (id: string, role: Role) => void
}

function UserRow({ user, index, isSelf, onRoleChange }: UserRowProps) {
  const [changing, setChanging] = useState(false)

  async function handleRoleChange(newRole: Role) {
    if (newRole === user.role) return
    setChanging(true)
    await onRoleChange(user.id, newRole)
    setChanging(false)
  }

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors"
    >
      {/* User info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} className="h-8 w-8 ring-2 ring-border" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user.name}
              {isSelf && (
                <span className="ml-1.5 text-[10px] font-semibold text-muted-foreground">(you)</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Joined date */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <p className="text-xs text-muted-foreground">
          {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </td>

      {/* Role */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {changing ? (
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
          ) : isSelf ? (
            <RoleBadge role={user.role} />
          ) : (
            <div className="relative">
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(e.target.value as Role)}
                className="appearance-none pl-2 pr-6 py-1 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="doctor">Doctor</option>
                <option value="admin">Administrator</option>
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            </div>
          )}
        </div>
      </td>
    </motion.tr>
  )
}

// ─── Create User Modal ────────────────────────────────────────────────────────

interface CreateUserModalProps {
  onSubmit: (data: { name: string; email: string; password: string; role: Role }) => Promise<void>
  onClose: () => void
  error: string | null
}

function CreateUserModal({ onSubmit, onClose, error }: CreateUserModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('doctor')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ name, email, password, role })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-base font-semibold text-foreground"
            style={{ fontFamily: 'Source Serif 4, serif' }}
          >
            Add New User
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Full name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Jane Smith"
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane.smith@clinic.nhs.uk"
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Temporary password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              minLength={8}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Role</label>
            <div className="flex gap-2">
              {(['doctor', 'admin'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={[
                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border transition-all',
                    role === r
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted',
                  ].join(' ')}
                >
                  {r === 'admin' ? <Shield className="h-3.5 w-3.5" /> : <Stethoscope className="h-3.5 w-3.5" />}
                  {r === 'admin' ? 'Administrator' : 'Doctor'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-brand text-brand-foreground py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create User
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserManagement() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)

  const users = useAdminStore((s) => s.users)
  const loadingUsers = useAdminStore((s) => s.loadingUsers)
  const error = useAdminStore((s) => s.error)
  const loadUsers = useAdminStore((s) => s.loadUsers)
  const createUser = useAdminStore((s) => s.createUser)
  const updateUserRole = useAdminStore((s) => s.updateUserRole)
  const clearError = useAdminStore((s) => s.clearError)

  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      navigate('/chat', { replace: true })
      return
    }
    loadUsers()
  }, [currentUser, navigate, loadUsers])

  if (!currentUser || currentUser.role !== 'admin') return null

  async function handleCreateUser(data: { name: string; email: string; password: string; role: Role }) {
    await createUser(data)
    if (!error) setShowCreateModal(false)
  }

  const filteredUsers = users.filter(
    (u) =>
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const adminCount = users.filter((u) => u.role === 'admin').length
  const doctorCount = users.filter((u) => u.role === 'doctor').length

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
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
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="h-9 w-9 rounded-lg bg-brand/10 flex items-center justify-center">
              <Users className="h-[18px] w-[18px] text-brand" />
            </div>
            <h1
              className="text-2xl font-semibold text-foreground"
              style={{ fontFamily: 'Source Serif 4, serif' }}
            >
              User Management
            </h1>
          </div>
          <div className="flex items-center gap-3 ml-12 text-xs text-muted-foreground">
            <span>{users.length} user{users.length !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{adminCount} admin{adminCount !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>{doctorCount} doctor{doctorCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <button
          onClick={() => { clearError(); setShowCreateModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-brand-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="relative mb-6 max-w-sm"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search users…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
      >
        {loadingUsers && users.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-brand animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Role
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {searchQuery ? 'No users match your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, i) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    index={i}
                    isSelf={u.id === currentUser.id}
                    onRoleChange={updateUserRole}
                  />
                ))
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Create user modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateUserModal
            onSubmit={handleCreateUser}
            onClose={() => setShowCreateModal(false)}
            error={error}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
