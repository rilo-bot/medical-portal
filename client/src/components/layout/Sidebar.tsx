import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Database,
  Shield,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Avatar } from '@/components/ui/avatar'
import type { User } from '@/types'

interface NavItemDef {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const NAV_ITEMS: NavItemDef[] = [
  { label: 'Chat', to: '/chat', icon: MessageSquare },
  { label: 'Knowledge Base', to: '/knowledge-base', icon: Database },
  { label: 'Admin', to: '/admin', icon: Shield, adminOnly: true },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  )

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-card border-r border-border h-screen sticky top-0 z-40">
        <SidebarContent
          items={visibleItems}
          user={user}
          onLogout={handleLogout}
          currentPath={location.pathname}
        />
      </aside>

      {/* ── Mobile overlay sidebar ───────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm md:hidden"
              onClick={onClose}
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col md:hidden shadow-2xl"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent
                items={visibleItems}
                user={user}
                onLogout={handleLogout}
                currentPath={location.pathname}
                onNavClick={onClose}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface SidebarContentProps {
  items: NavItemDef[]
  user: User | null
  onLogout: () => void
  currentPath: string
  onNavClick?: () => void
}

function SidebarContent({ items, user, onLogout, currentPath, onNavClick }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Wordmark */}
      <div className="px-5 py-5 shrink-0">
        <div className="flex items-center gap-2.5">
          {/* ECG pulse icon — clinical and memorable */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-brand-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span
            className="text-[17px] font-semibold text-foreground tracking-tight leading-none"
            style={{ fontFamily: 'Source Serif 4, serif' }}
          >
            ClinicalMind
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-border shrink-0" />

      {/* Section label */}
      <div className="px-5 pt-5 pb-1.5 shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Navigation
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5 min-h-0" aria-label="Main navigation">
        {items.map((item) => {
          const Icon = item.icon
          const isActive =
            currentPath === item.to ||
            (item.to !== '/' && currentPath.startsWith(item.to))

          return (
            <SidebarNavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={<Icon className="h-[18px] w-[18px]" />}
              isActive={isActive}
              onClick={onNavClick}
            />
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-5 h-px bg-border shrink-0" />

      {/* User card */}
      {user && (
        <div className="p-3 shrink-0">
          <div className="rounded-lg bg-muted/40 border border-border/60 p-3 flex items-center gap-3">
            <Avatar name={user.name} className="h-8 w-8 ring-2 ring-brand/20" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate leading-tight">
                {user.name}
              </p>
              <p className="text-[11px] text-muted-foreground truncate leading-tight capitalize mt-0.5">
                {user.role === 'admin' ? 'Administrator' : 'Doctor'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.93 }}
              onClick={onLogout}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface SidebarNavItemProps {
  to: string
  label: string
  icon: React.ReactNode
  isActive: boolean
  onClick?: () => void
}

function SidebarNavItem({ to, label, icon, isActive, onClick }: SidebarNavItemProps) {
  return (
    <NavLink to={to} onClick={onClick} className="block">
      <motion.div
        whileHover={{ x: isActive ? 0 : 4 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        className={[
          'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
          'transition-colors duration-150 group cursor-pointer',
          isActive
            ? 'bg-brand text-brand-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80',
        ].join(' ')}
      >
        {/* Subtle left accent on active */}
        {isActive && (
          <motion.span
            layoutId="sidebarActiveAccent"
            className="absolute left-0 inset-y-2 w-[3px] rounded-r-full bg-brand-foreground/40"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}

        <span
          className={[
            'transition-colors',
            isActive
              ? 'text-brand-foreground'
              : 'text-muted-foreground/80 group-hover:text-foreground',
          ].join(' ')}
        >
          {icon}
        </span>

        <span className="flex-1 leading-none">{label}</span>

        {isActive && (
          <ChevronRight className="h-3.5 w-3.5 text-brand-foreground/50 flex-shrink-0" />
        )}
      </motion.div>
    </NavLink>
  )
}
