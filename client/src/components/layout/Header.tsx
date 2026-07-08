import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const dark = theme === 'dark'

  function toggleDark() {
    setTheme(dark ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            {/* ECG icon */}
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
          </span>
          <span
            className="font-semibold tracking-tight text-foreground"
            style={{ fontFamily: 'Source Serif 4, serif' }}
          >
            ClinicalMind
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <Button
              size="sm"
              className="bg-brand text-brand-foreground hover:bg-brand/90 hidden md:inline-flex"
              onClick={() => navigate('/chat')}
            >
              Open Chat
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-brand text-brand-foreground hover:bg-brand/90 hidden md:inline-flex"
              onClick={() => navigate('/login')}
            >
              Sign in
            </Button>
          )}

          <button
            className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4 pt-2">
          <Button
            size="sm"
            className="mt-2 w-full bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => {
              setMenuOpen(false)
              navigate(user ? '/chat' : '/login')
            }}
          >
            {user ? 'Open Chat' : 'Sign in'}
          </Button>
        </div>
      )}
    </header>
  )
}
