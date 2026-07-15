import React from 'react'

interface Note {
  name: string
  midi: number
  cents?: number
}

interface Props {
  scale: Note[]
  selectedNoteIndex: number
  onNoteSelect: (idx: number) => void
}

// Qanun string courses (diatonic steps starting from G3 to G6, tuned to standard pitches)
// Cents offsets are adjusted using "mandals" (small levers).
// If a note has cents = -50, it means the mandals for that course are lowered by 2 or 3 commas.
export default function QanunLayout({ scale, selectedNoteIndex, onNoteSelect }: Props) {
  const selectedNote = scale[selectedNoteIndex]

  // We show 8 courses representing the octave of the scale (from scale[0] to scale[7])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          📐 Qanun Course Layout & Mandals (Levers)
        </span>
        {selectedNote && (
          <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
            Course: {selectedNote.name}
          </span>
        )}
      </div>

      <div style={{
        background: '#1c120c',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {scale.map((note, idx) => {
          const isSelected = idx === selectedNoteIndex
          const isMicrotonal = note.cents && note.cents !== 0
          
          // Lever visual state representation
          // Standard quarter-tone has 9 mandals. Neutral (0¢) = middle, Lowered (-50¢) = flipped down.
          const mandalState = isMicrotonal ? 'Lowered (3 Commas)' : 'Neutral (0¢)'

          return (
            <div
              key={idx}
              onClick={() => onNoteSelect(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                background: isSelected ? 'rgba(212,163,95,0.1)' : 'rgba(255,255,255,0.01)',
                border: `1px solid ${isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.04)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                  fontFamily: 'monospace'
                }}>
                  Course {idx + 1}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {note.name}
                </span>
              </div>

              {/* Mandal Lever visualizer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Visual Levers */}
                <div style={{ display: 'flex', gap: '2px' }}>
                  {Array.from({ length: 9 }).map((_, lIdx) => {
                    // Highlight the flipped mandals for microtonality
                    const isFlipped = isMicrotonal ? lIdx < 4 : lIdx >= 4 && lIdx < 7
                    return (
                      <div
                        key={lIdx}
                        style={{
                          width: '4px',
                          height: '14px',
                          background: isFlipped ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
                          borderRadius: '1px',
                          transform: isFlipped && isMicrotonal ? 'translateY(2px)' : 'none',
                          transition: 'transform 0.2s'
                        }}
                      />
                    )
                  })}
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  color: isMicrotonal ? 'var(--warning)' : 'var(--text-muted)',
                  fontWeight: 600,
                  minWidth: '100px',
                  textAlign: 'right'
                }}>
                  {mandalState}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
