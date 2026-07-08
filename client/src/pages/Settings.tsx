import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Globe,
  Bell,
  Lock,
  ChevronRight,
  Check,
  User,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore, type ThemeOption } from '@/stores/settingsStore'
import { Avatar } from '@/components/ui/avatar'
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog'

type ComplexityDefault = 'consultant' | 'gp' | 'student' | 'patient'

interface SettingSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

function SettingSection({ title, description, children }: SettingSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="divide-y divide-border/60">{children}</div>
    </motion.div>
  )
}

interface SettingRowProps {
  label: string
  description?: string
  children: React.ReactNode
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        checked ? 'bg-brand' : 'bg-muted',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200',
          checked ? 'translate-x-4' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Settings() {
  const user = useAuthStore((s) => s.user)

  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const complexityDefault = useSettingsStore((s) => s.complexityDefault)
  const setComplexityDefault = useSettingsStore((s) => s.setComplexityDefault)
  const notifications = useSettingsStore((s) => s.notifications)
  const setNotifications = useSettingsStore((s) => s.setNotifications)
  const showCitations = useSettingsStore((s) => s.showCitations)
  const setShowCitations = useSettingsStore((s) => s.setShowCitations)
  const autoScroll = useSettingsStore((s) => s.autoScroll)
  const setAutoScroll = useSettingsStore((s) => s.setAutoScroll)
  const saveHistory = useSettingsStore((s) => s.saveHistory)
  const setSaveHistory = useSettingsStore((s) => s.setSaveHistory)

  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  const THEME_OPTIONS: { value: ThemeOption; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  const COMPLEXITY_OPTIONS: { value: ComplexityDefault; label: string; description: string }[] = [
    { value: 'consultant', label: 'Consultant', description: 'Detailed, evidence-based clinical language' },
    { value: 'gp', label: 'GP', description: 'Practical primary care focus' },
    { value: 'student', label: 'Medical Student', description: 'Educational explanations with context' },
    { value: 'patient', label: 'Patient', description: 'Plain English, minimal jargon' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1.5">
          <div className="h-9 w-9 rounded-lg bg-brand/10 flex items-center justify-center">
            <SettingsIcon className="h-[18px] w-[18px] text-brand" />
          </div>
          <h1
            className="text-2xl font-semibold text-foreground"
            style={{ fontFamily: 'Source Serif 4, serif' }}
          >
            Settings
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          Customise your ClinicalMind experience
        </p>
      </motion.div>

      <div className="space-y-5">
        {/* Account */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
          >
            <SettingSection title="Account" description="Your profile and access level">
              <SettingRow
                label="Profile"
                description={user.email}
              >
                <div className="flex items-center gap-2">
                  <Avatar name={user.name} className="h-7 w-7 ring-1 ring-border" />
                  <div className="text-right">
                    <p className="text-xs font-medium text-foreground">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {user.role === 'admin' ? 'Administrator' : 'Doctor'}
                    </p>
                  </div>
                </div>
              </SettingRow>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Change password</p>
                  <p className="text-xs text-muted-foreground">Update your account password</p>
                </div>
                <button
                  onClick={() => setChangePasswordOpen(true)}
                  className="flex items-center gap-1 text-xs font-medium text-brand hover:opacity-80 transition-opacity"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Change
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </SettingSection>
          </motion.div>
        )}

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <SettingSection title="Appearance" description="Theme and display preferences">
            <SettingRow label="Theme" description="Choose your preferred colour scheme">
              <div className="flex gap-1.5">
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={[
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      theme === value
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted',
                    ].join(' ')}
                  >
                    {theme === value && <Check className="h-3 w-3" />}
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>
            </SettingRow>
          </SettingSection>
        </motion.div>

        {/* Chat preferences */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <SettingSection title="Chat" description="Defaults for the AI chat experience">
            <SettingRow
              label="Default complexity level"
              description="The complexity level applied when starting a new conversation"
            >
              <div className="flex gap-1">
                {COMPLEXITY_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setComplexityDefault(value)}
                    className={[
                      'px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all',
                      complexityDefault === value
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </SettingRow>
            <SettingRow
              label="Show citations panel"
              description="Automatically show references when a cited answer arrives"
            >
              <Toggle checked={showCitations} onChange={setShowCitations} />
            </SettingRow>
            <SettingRow
              label="Auto-scroll to latest"
              description="Scroll down as new content streams in"
            >
              <Toggle checked={autoScroll} onChange={setAutoScroll} />
            </SettingRow>
            <SettingRow
              label="Save conversation history"
              description="Retain conversations in your history panel"
            >
              <Toggle checked={saveHistory} onChange={setSaveHistory} />
            </SettingRow>
          </SettingSection>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <SettingSection title="Notifications">
            <SettingRow
              label="System notifications"
              description="Get notified about document indexing completion and system updates"
            >
              <Toggle checked={notifications} onChange={setNotifications} />
            </SettingRow>
          </SettingSection>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SettingSection title="About ClinicalMind">
            <SettingRow label="Version" description="Current application version">
              <span className="text-xs font-mono text-muted-foreground">1.0.0</span>
            </SettingRow>
            <SettingRow label="Data residency">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                United Kingdom
              </div>
            </SettingRow>
            <SettingRow label="Knowledge base">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                Private (RAG)
              </div>
            </SettingRow>
          </SettingSection>
        </motion.div>
      </div>

      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </div>
  )
}
