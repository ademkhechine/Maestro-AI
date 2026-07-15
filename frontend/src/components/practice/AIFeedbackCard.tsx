import { motion } from 'framer-motion'
import { MessageSquareText, Lightbulb, Calendar, Sparkles } from 'lucide-react'
import type { AIFeedback } from '../../store/practiceStore'

interface Props { feedback: AIFeedback }

export default function AIFeedbackCard({ feedback }: Props) {
  return (
    <motion.div className="card p-6"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>

      {/* AI Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: 'linear-gradient(135deg, #D4A35F22, #D9770622)' }}>
          🎼
        </div>
        <div>
          <div className="font-bold" style={{ color: 'var(--text-primary)' }}>Maestro AI Feedback</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Personalized coaching analysis</div>
        </div>
        <span className="badge badge-gold ml-auto text-xs flex items-center gap-1">
          <Sparkles size={10} /> AI Generated
        </span>
      </div>

      {/* Main feedback */}
      <div className="rounded-xl p-4 mb-5"
        style={{ background: 'rgba(212,163,95,0.06)', border: '1px solid rgba(212,163,95,0.15)' }}>
        <div className="flex gap-3">
          <MessageSquareText size={18} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {feedback.feedback}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={15} style={{ color: 'var(--warning)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Practice Recommendations
          </span>
        </div>
        <div className="space-y-2">
          {feedback.recommendations.map((rec, i) => (
            <motion.div key={i}
              className="flex gap-3 p-3 rounded-xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}>
              <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(212,163,95,0.2)', color: 'var(--primary)' }}>
                {i + 1}
              </span>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{rec}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3-day plan */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={15} style={{ color: '#818CF8' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            3-Day Practice Plan
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {feedback.practice_plan.map((day, i) => (
            <div key={i} className="rounded-xl p-3"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div className="text-xs font-bold mb-1" style={{ color: 'var(--primary)' }}>Day {day.day}</div>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{day.focus}</div>
              <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{day.duration_minutes} min</div>
              <div className="space-y-1">
                {day.exercises.map((ex, ei) => (
                  <div key={ei} className="text-xs" style={{ color: 'var(--text-muted)' }}>• {ex}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Encouragement */}
      <div className="rounded-xl p-4"
        style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(212,163,95,0.08))', border: '1px solid rgba(34,197,94,0.2)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>
          ✨ {feedback.encouragement}
        </p>
      </div>
    </motion.div>
  )
}
