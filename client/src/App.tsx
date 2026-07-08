import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AppShell from '@/components/Layout'
import HeaderOnlyLayout from '@/components/layout/HeaderOnlyLayout'
import Home from '@/pages/Home'
import Chat from '@/pages/Chat'
import KnowledgeBase from '@/pages/KnowledgeBase'
import Collections from '@/pages/Collections'
import SavedAnswers from '@/pages/SavedAnswers'
import AuditLog from '@/pages/AuditLog'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import DocumentUpload from '@/pages/DocumentUpload'
import UserManagement from '@/pages/UserManagement'
import AdminPanel from '@/pages/AdminPanel'
import { useAuthStore } from '@/stores/authStore'

/** Gate for the authenticated app shell — redirects to /login if there is no session. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)
  const location = useLocation()

  if (!initialized) return null
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <>{children}</>
}

export default function App() {
  const init = useAuthStore((s) => s.init)
  const navigate = useNavigate()

  useEffect(() => {
    init()
  }, [init])

  // Centralised handling for any API call that comes back 401: clear the
  // stale session and send the user back to login, wherever they are.
  useEffect(() => {
    function handleUnauthorized() {
      useAuthStore.setState({ user: null })
      navigate('/login', { replace: true })
    }
    window.addEventListener('api:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('api:unauthorized', handleUnauthorized)
  }, [navigate])

  return (
    <Routes>
      {/* ── Public routes — Header only (Home has its own footer) ─── */}
      <Route element={<HeaderOnlyLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* ── Login — full-screen, no layout wrapper ─── */}
      <Route path="/login" element={<Login />} />

      {/* ── Authenticated routes — sidebar app shell ─── */}
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:conversationId" element={<Chat />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} />
        <Route path="/knowledge-base/upload" element={<DocumentUpload />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/saved-answers" element={<SavedAnswers />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      {/* ── Fallback ───────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
