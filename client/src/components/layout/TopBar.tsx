import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Moon, Sun } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useSettingsStore } from '@/stores/settingsStore'

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
  const theme    = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const dark = theme === 'dark'

  const pageTitle = getPageTitle(location.pathname)

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
          className="text-[15px] font-semibold text-foreground shrink-0"
        >
          {pageTitle}
        </motion.h1>
      </AnimatePresence>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Dark mode toggle */}
      <button
        onClick={toggleDark}
        aria-label="Toggle dark mode"
        className="shrink-0 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </header>
  )
}
