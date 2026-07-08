import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    quote:
      'Before ClinicalMind, I was spending 20 minutes hunting through PDFs for a dosing protocol. Now I ask the question and get the cited answer in seconds — with the page reference so I can verify it myself.',
    name: 'Dr. Sarah Okonkwo',
    role: 'Consultant Physician, Internal Medicine',
    avatar: 'https://i.pravatar.cc/150?u=sarah-okonkwo',
  },
  {
    quote:
      'The confidence scores are the differentiator. I know at a glance whether the system found strong evidence in our own guidelines or is supplementing with general knowledge. That transparency matters in clinical practice.',
    name: 'Dr. James Whitfield',
    role: 'GP Principal, North London',
    avatar: 'https://i.pravatar.cc/150?u=james-whitfield',
  },
  {
    quote:
      "We loaded our entire formulary, referral pathways, and NICE guidelines. The search quality is exceptional — it understands STEMI, MI, and 'heart attack' as the same entity. The audit log gives our governance team exactly what they need.",
    name: 'Dr. Priya Mehta',
    role: 'Medical Director, Regional Health Trust',
    avatar: 'https://i.pravatar.cc/150?u=priya-mehta',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 },
  }),
}

export default function SocialProofSection() {
  return (
    <section className="bg-background py-24 lg:py-32 relative overflow-hidden">
      {/* Decorative teal blob */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] opacity-[0.04] blur-3xl rounded-full"
        style={{ background: 'hsl(var(--brand))' }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand">
            From clinicians
          </p>
          <h2
            className="text-4xl font-semibold text-foreground sm:text-5xl"
            style={{ fontFamily: 'Source Serif 4, serif' }}
          >
            Trusted at the point of care.
          </h2>
        </motion.div>

        {/* Quote cards — vary heights intentionally */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
              variants={cardVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={[
                'relative flex flex-col rounded-2xl border border-border bg-card p-7 shadow-sm',
                i === 1 ? 'sm:mt-8' : '',   // stagger middle card down
              ].join(' ')}
            >
              {/* Quote mark accent */}
              <div
                className="absolute top-5 right-6 opacity-10"
                style={{ color: 'hsl(var(--brand))' }}
              >
                <Quote className="h-12 w-12" />
              </div>

              {/* Stars */}
              <div className="mb-5 flex gap-0.5">
                {[...Array(5)].map((_, s) => (
                  <svg
                    key={s}
                    className="h-4 w-4"
                    fill="hsl(var(--brand-accent))"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote text */}
              <blockquote className="flex-1 text-sm leading-relaxed text-foreground/80 italic">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-brand/30"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="mt-16 grid grid-cols-2 gap-8 rounded-2xl border border-border bg-card p-8 sm:grid-cols-4"
        >
          {[
            { value: '< 2s', label: 'Avg answer time' },
            { value: '94%', label: 'Mean confidence score' },
            { value: '12+', label: 'File formats indexed' },
            { value: '100%', label: 'Source-cited answers' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="text-3xl font-bold"
                style={{ color: 'hsl(var(--brand))' }}
              >
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
