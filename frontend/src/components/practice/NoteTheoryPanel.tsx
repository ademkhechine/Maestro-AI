import { motion, AnimatePresence } from 'framer-motion'
import type { SelectedNoteDetails } from './StaffRenderer'

export default function NoteTheoryPanel({ details }: { details: SelectedNoteDetails | null }) {
  return (
    <AnimatePresence>
      {details && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(212,163,95,0.2)',
            borderRadius: '14px',
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
          }}
        >
          {[
            { label: 'Note', value: details.noteName },
            { label: 'MIDI', value: String(details.midi) },
            { label: 'Frequency', value: `${details.frequency.toFixed(1)} Hz` },
            { label: 'Octave', value: String(details.octave) },
            { label: 'Finger', value: String(details.fingerSuggestion) },
            { label: 'Scale Degree', value: details.scaleDegree },
            { label: 'Solfège', value: details.solfege },
            { label: 'Interval', value: details.intervalText ?? '—' },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '10px 12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>{value}</div>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
