import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          {/* ECG icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-brand"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span className="text-sm font-semibold text-foreground" style={{ fontFamily: 'Source Serif 4, serif' }}>
            ClinicalMind
          </span>
          <span className="text-xs">— AI Medical Assistant</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/login" className="hover:text-foreground transition-colors">Sign in</Link>
          <Link to="/chat" className="hover:text-foreground transition-colors">Chat</Link>
          <Link to="/knowledge-base" className="hover:text-foreground transition-colors">Knowledge Base</Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          For professional clinical use only. Always apply clinical judgement.
        </p>
      </div>
    </footer>
  )
}
