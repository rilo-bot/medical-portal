import { motion } from 'framer-motion'

const HOW_IMAGE =
  'https://images.pexels.com/photos/9062165/pexels-photo-9062165.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'

const steps = [
  {
    n: '01',
    title: 'Upload your clinical documents',
    body: 'Drag in PDFs, Word files, HTML, or paste a URL. ClinicalMind auto-extracts, deduplicates, versions, and indexes everything into your private knowledge base within minutes.',
  },
  {
    n: '02',
    title: 'Ask in natural language',
    body: 'Type your clinical question exactly as you would to a colleague. Use medical acronyms, ICD-10 codes, or plain English — the retriever understands them all.',
  },
  {
    n: '03',
    title: 'Receive cited, graded answers',
    body: 'Every answer cites its sources with title, section, and page. A confidence score and source count tell you how well the evidence supports the response. Supplemental AI knowledge is clearly labelled.',
  },
  {
    n: '04',
    title: 'Export, save, or go deeper',
    body: 'Save bookmarked answers, export to PDF or Word with full references, or follow up with a clarifying question — the conversation context is retained across turns.',
  },
]

const stepVariants = {
  hidden: { opacity: 0, x: -20 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut', delay: i * 0.1 },
  }),
}

export default function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden bg-muted/40 py-24 lg:py-32">
      {/* Background decorative arc */}
      <div
        className="pointer-events-none absolute -right-64 top-0 h-[700px] w-[700px] rounded-full opacity-[0.06]"
        style={{ background: 'hsl(var(--brand))' }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24 lg:items-center">
          {/* Left: text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand">
                How it works
              </p>
              <h2
                className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl"
                style={{ fontFamily: 'Source Serif 4, serif' }}
              >
                From document to<br />
                <span style={{ color: 'hsl(var(--brand))' }}>clinical answer</span>{' '}
                in four steps.
              </h2>
              <p className="mt-5 text-base text-muted-foreground leading-relaxed max-w-lg">
                The workflow is designed to feel like a natural extension of clinical practice —
                not a tech product you have to learn.
              </p>
            </motion.div>

            <ol className="mt-12 space-y-8">
              {steps.map((step, i) => (
                <motion.li
                  key={step.n}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={stepVariants}
                  className="flex gap-5"
                >
                  {/* Number circle */}
                  <div className="flex-shrink-0">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                      style={{ background: 'hsl(var(--brand))' }}
                    >
                      {step.n}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="pt-1">
                    <h3
                      className="font-semibold text-foreground text-lg leading-snug mb-1.5"
                      style={{ fontFamily: 'Source Serif 4, serif' }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>

          {/* Right: image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Card frame */}
            <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-border">
              <img
                src={HOW_IMAGE}
                alt="Physician reviewing patient records in a bright clinical office"
                className="h-full w-full object-cover object-top aspect-[4/5] lg:aspect-[4/5]"
                loading="lazy"
              />
              {/* bottom gradient label */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent px-6 pb-6 pt-16">
                <p className="text-sm font-medium text-white/90">
                  Physicians stay in their workflow — ClinicalMind answers within the context of care.
                </p>
              </div>
            </div>

            {/* Floating metric badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="absolute -left-6 top-1/3 -translate-y-1/2 rounded-xl bg-card border border-border shadow-xl p-4 backdrop-blur-sm"
            >
              <p className="text-xs text-muted-foreground mb-0.5">Avg. retrieval time</p>
              <p
                className="text-2xl font-bold"
                style={{ color: 'hsl(var(--brand))' }}
              >
                &lt; 2s
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">across 10k+ documents</p>
            </motion.div>

            {/* Floating confidence badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.65, duration: 0.4 }}
              className="absolute -right-4 bottom-24 rounded-xl bg-card border border-border shadow-xl p-4 backdrop-blur-sm"
            >
              <p className="text-xs text-muted-foreground mb-1">Confidence score</p>
              <div className="flex items-end gap-1">
                <p
                  className="text-2xl font-bold"
                  style={{ color: 'hsl(var(--brand-accent))' }}
                >
                  94%
                </p>
              </div>
              <div className="mt-2 h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '94%' }}
                  viewport={{ once: true }}
                  transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'hsl(var(--brand-accent))' }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
