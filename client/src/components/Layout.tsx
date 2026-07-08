/**
 * src/components/Layout.tsx
 *
 * Authenticated app shell — entry file for the shell/navigation slice.
 * Default-exports Layout; named-exports AppShell (alias).
 *
 * Architecture:
 *  - Left sidebar (w-64): ClinicalMind wordmark, role-gated nav items,
 *    user card with avatar + logout, framer-motion hover animations.
 *  - Top bar (h-14): page title left, complexity-level pill selector center
 *    (visible on /chat only), user avatar + logout right.
 *  - Mobile: sidebar collapses; bottom nav bar replaces it.
 *  - AnimatePresence page transitions (opacity + y-slide, 220ms).
 *
 * Sub-components live in src/components/layout/:
 *   Sidebar.tsx, TopBar.tsx, ComplexitySelector.tsx, MobileBottomNav.tsx
 */
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter:   { opacity: 1, y: 0  },
  exit:    { opacity: 0, y: -6 },
}

const pageTransition = {
  duration: 0.22,
  ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* ── Left sidebar ──────────────────────────────────────── */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main column ───────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Sticky top bar */}
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable content — bottom padding for mobile nav */}
        <main className="flex-1 overflow-y-auto overscroll-contain pb-16 md:pb-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              transition={pageTransition}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────── */}
      <MobileBottomNav />
    </div>
  )
}

export default Layout

/** Named alias — satisfies the AppShell export contract */
export { Layout as AppShell }
