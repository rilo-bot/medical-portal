import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { BookMarked, BarChart3, ShieldCheck, Layers, Zap, Search } from 'lucide-react'

interface Feature {
  icon: React.ReactNode
  label: string
  title: string
  body: string
  size: 'large' | 'medium' | 'small'
  accent?: boolean
}

const features: Feature[] = [
  {
    icon: <BookMarked className="h-6 w-6" />,
    label: 'Core capability',
    title: 'RAG cited answers — every source, every time',
    body:
      'Your knowledge base is searched first on every query. Answers carry citations with document title, section heading, and page number. You always know exactly where the information came from — never a black-box response.',
    size: 'large',
    accent: true,
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    label: 'Trust layer',
    title: 'Confidence scores & source counts',
    body:
      'Each answer surfaces a confidence score based on how well retrieved passages match your query, plus the number of supporting sources — so you can calibrate how much weight to give the response.',
    size: 'medium',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    label: 'Access control',
    title: 'Role-based access',
    body:
      'Administrator and Doctor roles gate every action. Admins manage the knowledge base; Doctors query it. Full audit log of every action, with encryption at rest and in transit.',
    size: 'medium',
  },
  {
    icon: <Search className="h-6 w-6" />,
    label: 'Retrieval',
    title: 'Semantic + keyword hybrid search',
    body:
      'Medical synonyms, acronyms (MI, STEMI, DKA, COPD) and ICD-10 terms understood natively. The retriever combines vector similarity with keyword matching for the highest recall.',
    size: 'small',
  },
  {
    icon: <Layers className="h-6 w-6" />,
    label: 'Knowledge base',
    title: 'Auto-indexed collections',
    body:
      'Upload PDF, Word, text, HTML, or a URL. Documents are extracted, deduped, versioned, and live-indexed — queryable in minutes.',
    size: 'small',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    label: 'Adaptability',
    title: 'Four complexity levels',
    body:
      'Request the same answer at Consultant, GP, Medical Student, or Patient complexity — the same retrieval, calibrated explanation depth.',
    size: 'small',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
}

const FeaturesSection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section
      ref={ref}
      id="features"
      className="relative bg-background py-24 lg:py-32"
    >
      {/* Subtle top divider */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--border)), transparent)' }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-16 max-w-2xl"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand">
            Capabilities
          </p>
          <h2
            className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl"
            style={{ fontFamily: 'Source Serif 4, serif' }}
          >
            Built for clinical rigour,<br />not generic AI.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Every design decision starts with: will a clinician trust this answer at the point of care?
          </p>
        </motion.div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat, i) => (
            <motion.article
              key={feat.title}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              variants={cardVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={[
                'group relative flex flex-col rounded-xl bg-card border border-border p-6 shadow-sm',
                'border-l-[3px]',
                feat.accent
                  ? 'border-l-brand lg:col-span-2 lg:row-span-1'
                  : 'border-l-brand-accent',
                feat.size === 'large' ? 'pb-8' : '',
              ].join(' ')}
              style={
                feat.size === 'large'
                  ? { paddingTop: '2rem', paddingBottom: '2.5rem' }
                  : {}
              }
            >
              {/* Icon */}
              <div
                className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors group-hover:bg-brand/10"
                style={{ background: 'hsl(var(--accent))' }}
              >
                <span className="text-brand">{feat.icon}</span>
              </div>

              {/* Label */}
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {feat.label}
              </p>

              {/* Title */}
              <h3
                className={[
                  'font-semibold text-foreground leading-snug',
                  feat.size === 'large' ? 'text-2xl mb-4' : 'text-lg mb-3',
                ].join(' ')}
                style={{ fontFamily: 'Source Serif 4, serif' }}
              >
                {feat.title}
              </h3>

              {/* Body */}
              <p
                className={[
                  'leading-relaxed text-muted-foreground',
                  feat.size === 'large' ? 'text-base' : 'text-sm',
                ].join(' ')}
              >
                {feat.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
})

FeaturesSection.displayName = 'FeaturesSection'
export default FeaturesSection
