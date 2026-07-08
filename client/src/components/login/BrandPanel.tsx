import { motion } from 'framer-motion'

const CLINICAL_IMAGE = 'https://images.pexels.com/photos/5407204/pexels-photo-5407204.jpeg'

export default function BrandPanel() {
  return (
    <div className="relative hidden md:flex flex-col w-1/2 min-h-screen overflow-hidden bg-brand">
      {/* Full-bleed background photo */}
      <img
        src={CLINICAL_IMAGE}
        alt="Doctor reviewing clinical notes"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
      />

      {/* Scrim: rich teal gradient over the image */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(160deg, hsl(var(--brand) / 0.88) 0%, hsl(var(--brand) / 0.72) 55%, hsl(var(--brand) / 0.55) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-12 py-14 justify-between">
        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-2.5">
            {/* Icon mark */}
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M10 2C10 2 4 5.5 4 11C4 14.3137 6.68629 17 10 17C13.3137 17 16 14.3137 16 11C16 5.5 10 2 10 2Z"
                  fill="white"
                  fillOpacity="0.9"
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
              className="text-white text-2xl tracking-tight"
              style={{ fontFamily: 'Source Serif 4, serif', fontWeight: 600 }}
            >
              ClinicalMind
            </span>
          </div>
        </motion.div>

        {/* Value proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="space-y-6"
        >
          <h2
            className="text-white text-4xl leading-[1.15] tracking-tight"
            style={{ fontFamily: 'Source Serif 4, serif', fontWeight: 400 }}
          >
            Clinical intelligence,
            <br />
            <em className="not-italic" style={{ fontStyle: 'italic', fontWeight: 300 }}>
              grounded in your
            </em>
            <br />
            knowledge base.
          </h2>

          <p className="text-white/70 text-base leading-relaxed max-w-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
            Every answer cites its source. Every response respects your clinical judgement.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {['RAG-cited answers', 'Confidence scores', 'Role-based access', 'Audit logging'].map((f) => (
              <span
                key={f}
                className="text-xs text-white/80 border border-white/25 rounded-full px-3 py-1"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {f}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-white/40 text-xs"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Designed for healthcare professionals
        </motion.p>
      </div>
    </div>
  )
}
