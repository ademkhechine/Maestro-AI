import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(145deg, #1A1310 0%, #0F0805 100%)' }}>
        {/* Background music notes decoration */}
        <div className="absolute inset-0 pointer-events-none">
          {['𝄞', '♩', '♪', '♫', '♬', '𝄢'].map((note, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl select-none"
              style={{
                color: 'rgba(212, 163, 95, 0.06)',
                left: `${15 + i * 13}%`,
                top: `${10 + (i % 3) * 25}%`,
                fontSize: `${2 + (i % 3)}rem`,
              }}
              animate={{ y: [0, -20, 0], opacity: [0.04, 0.1, 0.04] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
            >
              {note}
            </motion.div>
          ))}
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, #D4A35F, #D97706)' }}>
              🎼
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Maestro AI</span>
          </div>
          <h1 className="heading-xl mb-4">
            <span className="text-gradient">Your AI</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>Music Coach</span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            Practice smarter. Listen deeper. Master your instrument with AI-powered feedback that understands every note you play.
          </p>
        </div>

        {/* Testimonials */}
        <div className="relative z-10 space-y-4">
          {[
            { quote: "Maestro AI helped me cut my practice time in half while doubling my progress.", name: "Sarah Chen", role: "Concert Violinist" },
            { quote: "The AI feedback is incredibly specific — it even caught a habit I had for 10 years.", name: "Marcus Webb", role: "Piano Teacher" },
          ].map((t, i) => (
            <motion.div key={i} className="card p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.2 }}>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                "{t.quote}"
              </p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'rgba(212, 163, 95, 0.2)', color: 'var(--primary)' }}>
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Instruments */}
        <div className="relative z-10 flex gap-3">
          {[
            { icon: '🎻', label: 'Violin' },
            { icon: '🎹', label: 'Piano' },
            { icon: '🎸', label: 'Guitar' },
            { icon: '🎤', label: 'Voice' },
          ].map((inst, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl card"
                style={{ background: 'rgba(212, 163, 95, 0.06)' }}>
                {inst.icon}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{inst.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg, #D4A35F, #D97706)' }}>
              🎼
            </div>
            <span className="text-lg font-bold">Maestro AI</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
