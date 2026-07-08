import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CtaBand() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden bg-brand py-24 lg:py-28">
      {/* Background texture rings */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full border border-white/10" />

      {/* Subtle glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/60">
            Get started today
          </p>
          <h2
            className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl"
            style={{ fontFamily: 'Source Serif 4, serif' }}
          >
            Clinical intelligence,<br />
            grounded in your evidence.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            Upload your guidelines, formularies, and protocols once. Ask anything, get cited answers
            in seconds — from your own knowledge base.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-brand hover:bg-white/90 shadow-lg px-10 font-semibold"
              onClick={() => navigate('/login')}
            >
              Start chatting
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-white/55 text-sm">
            {[
              'Encrypted at rest & in transit',
              'Full audit logging',
              'Role-based access control',
            ].map((badge) => (
              <span key={badge} className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-white/70" />
                {badge}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
