import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginCard() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    await login(email, password)
    // After login, check if user is set (success path)
    const user = useAuthStore.getState().user
    if (user) {
      navigate('/chat', { replace: true })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-sm"
    >
      {/* Mobile wordmark — visible on small screens only */}
      <div className="flex items-center gap-2 mb-10 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M10 2C10 2 4 5.5 4 11C4 14.3137 6.68629 17 10 17C13.3137 17 16 14.3137 16 11C16 5.5 10 2 10 2Z"
              fill="white"
              fillOpacity="0.95"
            />
            <path
              d="M7.5 11H12.5M10 8.5V13.5"
              stroke="hsl(var(--brand))"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span
          className="text-foreground text-xl tracking-tight"
          style={{ fontFamily: 'Source Serif 4, serif', fontWeight: 600 }}
        >
          ClinicalMind
        </span>
      </div>

      {/* Heading */}
      <div className="mb-8 space-y-1.5">
        <h1
          className="text-3xl text-foreground"
          style={{ fontFamily: 'Source Serif 4, serif', fontWeight: 400 }}
        >
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          Sign in to access your clinical workspace
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3"
          style={{ backgroundColor: 'hsl(var(--destructive) / 0.07)' }}
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive leading-snug" style={{ fontFamily: 'Inter, sans-serif' }}>
            {error}
          </p>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground text-sm font-medium">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@hospital.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="h-11 text-sm focus-visible:ring-brand"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="h-11 text-sm pr-11 focus-visible:ring-brand"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full h-11 bg-brand text-white hover:bg-brand/90 transition-all duration-200 font-medium mt-2 rounded-lg shadow-sm"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </span>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      {/* Divider note */}
      <div className="mt-8 pt-7 border-t border-border">
        <p className="text-xs text-muted-foreground text-center leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          Access is restricted to authorised healthcare professionals.
          <br />
          Contact your administrator to request access.
        </p>
      </div>
    </motion.div>
  )
}
