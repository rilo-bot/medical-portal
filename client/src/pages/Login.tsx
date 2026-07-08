import BrandPanel from '@/components/login/BrandPanel'
import LoginCard from '@/components/login/LoginCard'

/**
 * Login page — /login
 *
 * Split-screen layout:
 *  - Left (≥md): bg-brand panel with ClinicalMind wordmark, clinical photo + scrim, value prop
 *  - Right: centered white card with sign-in form
 *
 * No Layout wrapper — this page owns its full viewport.
 * Mobile: stacks vertically (brand panel hidden, card full-screen).
 */
export default function Login() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Left: Brand panel ── */}
      <BrandPanel />

      {/* ── Right: Auth card ── */}
      <div className="flex flex-1 flex-col items-center justify-center min-h-screen px-6 py-14 bg-background">
        <LoginCard />
      </div>
    </div>
  )
}
