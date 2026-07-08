import { motion } from 'framer-motion'

export default function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left"
        >
          {/* Brand mark */}
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-bold tracking-tight"
              style={{ fontFamily: 'Source Serif 4, serif', color: 'hsl(var(--brand))' }}
            >
              ClinicalMind
            </span>
            <span className="text-xs text-muted-foreground">
              — AI Medical Assistant
            </span>
          </div>

          {/* Legal */}
          <p className="text-xs text-muted-foreground">
            &copy; {year} ClinicalMind. For qualified healthcare professionals only.
            Supports — never replaces — clinical judgement.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
