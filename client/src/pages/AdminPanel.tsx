import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Users, FileText, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const cards = [
  {
    title: 'User Management',
    description: 'Invite users, assign roles (Administrator / Doctor), and revoke access with full audit coverage.',
    icon: Users,
    href: '/users',
    accent: 'bg-brand/10 text-brand',
  },
  {
    title: 'Audit Log',
    description: 'Full activity audit trail — every query, upload, and role action logged with timestamps for compliance.',
    icon: FileText,
    href: '/audit-log',
    accent: 'bg-brand-accent/20 text-brand-accent',
  },
]

export default function AdminPanel() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  // Guard: redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/chat', { replace: true })
    }
  }, [user, navigate])

  if (!user || user.role !== 'admin') return null

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10">
            <Shield className="h-5 w-5 text-brand" />
          </div>
          <h1
            className="text-2xl font-semibold text-foreground"
            style={{ fontFamily: 'Source Serif 4, serif' }}
          >
            Admin Panel
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-12">
          Manage users, roles, and review the system audit trail.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.button
              key={card.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(card.href)}
              className="group text-left w-full rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-semibold text-foreground">{card.title}</h2>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
