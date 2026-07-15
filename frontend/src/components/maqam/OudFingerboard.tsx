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

// Oud String Tunings (MIDI numbers)
const OUD_STRINGS = [
  { name: 'C4', midi: 60 },
  { name: 'G3', midi: 55 },
  { name: 'D3', midi: 50 },
  { name: 'A2', midi: 45 },
  { name: 'F2', midi: 41 },
  { name: 'C2', midi: 36 }
]

export default function OudFingerboard({ scale, selectedNoteIndex, onNoteSelect }: Props) {
  const selectedNote = scale[selectedNoteIndex]

  // Fretless fingerboard positions mapping
  // Since Oud is fretless, position is based on scale length (distance from nut in %)
  // We approximate the position for diatonic intervals:
  // open = 0, half-step = ~6%, whole-step = ~12%, minor 3rd = ~18%, major 3rd = ~24%, etc.
  const getOudPosition = (stringMidi: number, targetMidi: number, centsOffset = 0) => {
    const diffSemitones = targetMidi - stringMidi + (centsOffset / 100)
    if (diffSemitones < 0 || diffSemitones > 7) return null // Only show positions within first 5 positions
    
    // Simple logarithmic fretless layout scaling (1 - 2^(-semitones/12))
    const positionPct = (1 - Math.pow(2, -diffSemitones / 12)) * 100
    return positionPct
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          🪕 Oud Fingerboard (Fretless)
        </span>
        {selectedNote && (
          <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
            Active: {selectedNote.name}
          </span>
        )}
      </div>

      <div style={{
        position: 'relative',
        height: '180px',
        background: 'linear-gradient(to right, #2c1a0e, #1a0f08)',
        borderRadius: '12px',
        border: '2px solid rgba(212,163,95,0.3)',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
      }}>
        {/* Nut (Left border of fingerboard) */}
        <div style={{
          position: 'absolute', top: 0, left: '40px', bottom: 0,
          width: '6px', background: '#e5c158',
          boxShadow: '0 0 8px rgba(229,193,88,0.5)', zIndex: 5
        }} />

        {/* Peg box marker/label */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: '40px',
          background: '#120a05', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-around', alignItems: 'center',
          borderRight: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem',
          fontWeight: 700, color: 'var(--text-muted)'
        }}>
          {OUD_STRINGS.map(s => <span key={s.name}>{s.name[0]}</span>)}
        </div>

        {/* Position markers (dotted lines for guidance) */}
        {[
          { label: 'Nut', pos: '40px' },
          { label: 'Pos I', pos: '18%' },
          { label: 'Pos II', pos: '32%' },
          { label: 'Pos III', pos: '44%' },
          { label: 'Pos IV', pos: '55%' }
        ].map((m, idx) => (
          <div key={idx} style={{
            position: 'absolute', left: m.pos, top: 0, bottom: 0,
            borderLeft: '1px dashed rgba(212,163,95,0.12)', zIndex: 1,
            pointerEvents: 'none'
          }}>
            <span style={{
              position: 'absolute', bottom: '4px', left: '4px',
              fontSize: '0.55rem', color: 'rgba(212,163,95,0.3)',
              fontFamily: 'monospace'
            }}>{m.label}</span>
          </div>
        ))}

        {/* String lines and Interactive note positions */}
        <div style={{
          position: 'absolute', left: '46px', right: 0, top: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-around',
          padding: '10px 0'
        }}>
          {OUD_STRINGS.map((string, sIdx) => {
            // Find notes in the active scale that map to this string
            const stringNotes = scale.map((note, idx) => {
              const posPct = getOudPosition(string.midi, note.midi, note.cents)
              return { note, idx, posPct }
            }).filter(item => item.posPct !== null) as { note: Note; idx: number; posPct: number }[]

            return (
              <div key={string.name} style={{
                position: 'relative', height: '16px',
                display: 'flex', alignItems: 'center'
              }}>
                {/* Visual String line */}
                <div style={{
                  position: 'absolute', left: 0, right: 0,
                  height: `${3 - sIdx * 0.3}px`, // high strings are thinner
                  background: sIdx < 2 ? 'linear-gradient(to bottom, #d1d5db, #9ca3af)' : 'linear-gradient(to bottom, #f3f4f6, #d1d5db)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.5)', zIndex: 2
                }} />

                {/* Note markers on this string */}
                {stringNotes.map(({ note, idx, posPct }) => {
                  const isSelected = idx === selectedNoteIndex
                  return (
                    <button
                      key={idx}
                      onClick={() => onNoteSelect(idx)}
                      style={{
                        position: 'absolute',
                        left: `${posPct}%`,
                        transform: 'translateX(-50%)',
                        width: '20px', height: '20px',
                        borderRadius: '50%',
                        background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.9)',
                        border: `2px solid ${isSelected ? '#0F0805' : 'var(--primary)'}`,
                        boxShadow: isSelected ? '0 0 10px var(--primary)' : '0 2px 4px rgba(0,0,0,0.4)',
                        zIndex: 4, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 900,
                        color: isSelected ? '#0F0805' : 'var(--text-dark)'
                      }}
                      title={`${note.name} (${note.cents ? note.cents : 0}¢)`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
