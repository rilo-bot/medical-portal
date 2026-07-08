import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const HERO_IMAGE =
  'https://images.pexels.com/photos/5452291/pexels-photo-5452291.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'

const headline = 'Clinical intelligence grounded in your knowledge base.'

// Split into words for stagger animation
const words = headline.split(' ')

interface HeroSectionProps {
  featuresRef: React.RefObject<HTMLElement>
}

export default function HeroSection({ featuresRef }: HeroSectionProps) {
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: shouldReduce ? 0 : 0.07,
        delayChildren: 0.2,
      },
    },
  }

  const wordVariants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    show: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut', delay },
    }),
  }

  return (
    <section className="relative isolate min-h-[92vh] flex items-center overflow-hidden">
      {/* Background image with dark scrim */}
      <div className="absolute inset-0 -z-10">
        <img
          src={HERO_IMAGE}
          alt="Healthcare professional using tablet in clinical setting"
          className="h-full w-full object-cover object-center"
        />
        {/* multi-layer scrim — strong left-half cover for text, lighter right for image peek */}
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/75 via-foreground/50 to-foreground/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
      </div>

      {/* Subtle brand-teal glow bottom-left */}
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'hsl(var(--brand))' }}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-32 lg:px-12 lg:py-40">
        <div className="max-w-3xl">
          {/* Status pill */}
          <motion.div
            initial="hidden"
            animate="show"
            custom={0}
            variants={fadeUp}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm"
          >
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: 'hsl(var(--brand-accent))' }}
            />
            AI Medical Assistant — RAG-powered, citation-first
          </motion.div>

          {/* Staggered headline */}
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-x-[0.3em] gap-y-1 text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl"
            style={{ fontFamily: 'Source Serif 4, serif' }}
            aria-label={headline}
          >
            {words.map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                variants={wordVariants}
                className="inline-block"
                style={
                  word === 'knowledge' || word === 'base.'
                    ? { color: 'hsl(var(--brand-accent))' }
                    : undefined
                }
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial="hidden"
            animate="show"
            custom={0.65}
            variants={fadeUp}
            className="mt-8 max-w-xl text-lg leading-relaxed text-white/75"
          >
            Ask clinical questions in natural language. ClinicalMind retrieves evidence from your
            private documents first, cites every source with section and page, and clearly labels
            when it supplements with general AI knowledge.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial="hidden"
            animate="show"
            custom={0.85}
            variants={fadeUp}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90 shadow-lg shadow-brand/30 px-8 font-semibold"
              onClick={() => navigate('/login')}
            >
              Start chatting
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm px-8 font-semibold"
              onClick={scrollToFeatures}
            >
              Explore features
            </Button>
          </motion.div>

          {/* Trust note */}
          <motion.p
            initial="hidden"
            animate="show"
            custom={1.05}
            variants={fadeUp}
            className="mt-8 text-xs text-white/45"
          >
            For qualified healthcare professionals only. Supports — never replaces — clinical judgement.
          </motion.p>

          {/* Signature moment: mini chat preview card */}
          <motion.div
            initial="hidden"
            animate="show"
            custom={1.25}
            variants={fadeUp}
            className="mt-12 max-w-lg rounded-xl border border-white/15 bg-white/8 backdrop-blur-md p-4 hidden sm:block"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <p className="text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Live example</p>
            <p className="text-sm text-white/75 mb-3 italic">
              &ldquo;What is the first-line treatment for community-acquired pneumonia in adults?&rdquo;
            </p>
            <div className="flex items-start gap-2">
              <div
                className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: 'hsl(var(--brand))' }}
              >
                AI
              </div>
              <div>
                <p className="text-xs text-white/80 leading-relaxed">
                  Per the <span style={{ color: 'hsl(var(--brand-accent))' }}>BTS CAP Guidelines (p.12)</span>, amoxicillin 500mg TDS for 5 days is first-line for low-severity CAP…
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: 'hsl(var(--brand-accent)/0.2)', color: 'hsl(var(--brand-accent))' }}
                  >
                    <span className="h-1 w-1 rounded-full" style={{ background: 'hsl(var(--brand-accent))' }} />
                    96% confidence · 3 sources
                  </span>
                  <span className="text-[10px] text-white/35">from your knowledge base</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        onClick={scrollToFeatures}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 hover:text-white/70 transition-colors"
        aria-label="Scroll to features"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.button>
    </section>
  )
}
