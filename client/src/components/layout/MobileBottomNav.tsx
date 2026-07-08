import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, Database, Shield, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

interface MobileNavItem {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const NAV_ITEMS: MobileNavItem[] = [
  { label: 'Chat',      to: '/chat',           icon: MessageSquare },
  { label: 'Knowledge', to: '/knowledge-base',  icon: Database },
  { label: 'Admin',     to: '/admin',           icon: Shield, adminOnly: true },
]

export default function MobileBottomNav() {
  const user     = useAuthStore((s) => s.user)
  const logout   = useAuthStore((s) => s.logout)
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
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 border-t border-border backdrop-blur supports-[backdrop-filter]:bg-card/90"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive =
            location.pathname === item.to ||
            (item.to !== '/' && location.pathname.startsWith(item.to))

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg flex-1 max-w-[90px]"
            >
              <motion.div
                animate={{ scale: isActive ? 1.12 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative flex items-center justify-center"
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? 'text-brand' : 'text-muted-foreground'
                  }`}
                />
                {isActive && (
                  <motion.span
                    layoutId="mobileActiveTab"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.div>
              <span
                className={`text-[10px] font-medium leading-tight transition-colors ${
                  isActive ? 'text-brand' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          )
        })}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive transition-colors flex-1 max-w-[90px]"
          aria-label="Log out"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-[10px] font-medium leading-tight">Logout</span>
        </button>
      </div>
    </nav>
  )
}
