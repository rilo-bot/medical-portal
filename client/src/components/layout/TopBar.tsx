import { motion, AnimatePresence } from 'framer-motion'
import { Menu, LogOut, Moon, Sun } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore } from '@/stores/chatStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { ComplexityLevel } from '@/types'
import ComplexitySelector from './ComplexitySelector'
import { Avatar } from '@/components/ui/avatar'

const PAGE_TITLES: Record<string, string> = {
  '/':                      'Home',
  '/chat':                  'Chat',
  '/knowledge-base':        'Knowledge Base',
  '/knowledge-base/upload': 'Upload Document',
  '/collections':           'Collections',
  '/admin':                 'Admin Panel',
  '/users':                 'User Management',
  '/saved-answers':         'Saved Answers',
  '/audit-log':             'Audit Log',
  '/settings':              'Settings',
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (key !== '/' && pathname.startsWith(key)) return val
  }
  return 'ClinicalMind'
}

interface TopBarProps {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const location  = useLocation()
  const navigate  = useNavigate()
  const user             = useAuthStore((s) => s.user)
  const logout           = useAuthStore((s) => s.logout)
  const complexityLevel  = useChatStore((s) => s.complexityLevel)
  const setComplexityLevel = useChatStore((s) => s.setComplexityLevel)
  const theme    = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const dark = theme === 'dark'

  const isChat    = location.pathname === '/chat'
  const pageTitle = getPageTitle(location.pathname)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  function toggleDark() {
    setTheme(dark ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-30 h-14 w-full bg-card/90 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-card/80 flex items-center px-4 gap-3 shrink-0">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="md:hidden shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title — left */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.h1
          key={pageTitle}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.18 }}
          className="text-[15px] font-semibold text-foreground shrink-0 hidden sm:block"
          style={{ fontFamily: 'Source Serif 4, serif' }}
        >
          {pageTitle}
        </motion.h1>
      </AnimatePresence>

      {/* Center — complexity selector (chat only) */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isChat && (
            <motion.div
              key="complexity"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.18 }}
            >
              <ComplexitySelector
                value={complexityLevel}
                onChange={(l: ComplexityLevel) => setComplexityLevel(l)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right — dark mode + user info + logout */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          aria-label="Toggle dark mode"
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {user && (
          <div className="flex items-center gap-2 ml-1">
            {/* Avatar + name (hidden on mobile) */}
            <div className="hidden sm:flex items-center gap-2.5">
              <Avatar name={user.name} className="h-7 w-7 ring-1 ring-border" />
              <div className="hidden lg:block">
                <p className="text-xs font-medium text-foreground leading-tight max-w-[140px] truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight capitalize">
                  {user.role === 'admin' ? 'Administrator' : 'Doctor'}
                </p>
              </div>
            </div>

            {/* Logout */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        )}
      </div>
    </header>
  )
}
