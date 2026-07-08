/**
 * HeaderOnlyLayout — a minimal public layout that wraps pages that include
 * their own footer (e.g. the Home landing page which has LandingFooter).
 */
import { Outlet } from 'react-router-dom'
import Header from './Header'

export default function HeaderOnlyLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
