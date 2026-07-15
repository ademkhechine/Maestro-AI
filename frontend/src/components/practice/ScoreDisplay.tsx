import { motion } from 'framer-motion'
import type { SessionAnalysis } from '../../store/practiceStore'

interface Props { analysis: SessionAnalysis }

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 36
  const circ = 2 * Math.PI * radius
  const dash = (score / 100) * circ

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(212,163,95,0.1)" strokeWidth="6" />
          <motion.circle
            cx="48" cy="48" r={radius}
            fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black" style={{ color }}>{score.toFixed(0)}</span>
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>%</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-center" style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  )
}

export default function ScoreDisplay({ analysis }: Props) {
  const overallColor =
    analysis.overall_score >= 90 ? 'var(--success)' :
    analysis.overall_score >= 75 ? 'var(--primary)' :
    analysis.overall_score >= 60 ? 'var(--warning)' : 'var(--error)'

  return (
    <motion.div className="card p-6"
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <h2 className="heading-md mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
        Performance Results
      </h2>

      {/* Overall score hero */}
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <motion.div
            className="text-7xl font-black mb-1 text-gradient"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
            {analysis.overall_score.toFixed(1)}%
          </motion.div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Overall Score</div>
        </div>
      </div>

      {/* Individual scores */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <ScoreRing score={analysis.pitch_accuracy} label="Pitch" color="#D4A35F" />
        <ScoreRing score={analysis.rhythm_accuracy} label="Rhythm" color="#818CF8" />
        <ScoreRing score={analysis.tempo_stability} label="Tempo" color="#22C55E" />
        <ScoreRing score={analysis.expression_score} label="Expression" color="#F59E0B" />
      </div>

      {/* Issues summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Missed Notes', value: analysis.missed_notes, color: 'var(--error)' },
          { label: 'Wrong Notes', value: analysis.wrong_notes, color: 'var(--warning)' },
          { label: 'Problem Areas', value: analysis.problem_measures.length, color: 'var(--primary)' },
        ].map(({ label, value, color }, i) => (
          <div key={i} className="rounded-xl p-3 text-center"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
