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

// Violin String Tunings (MIDI numbers)
const VIOLIN_STRINGS = [
  { name: 'E5', midi: 76 },
  { name: 'A4', midi: 69 },
  { name: 'D4', midi: 62 },
  { name: 'G3', midi: 55 }
]

export default function ViolinFingerboard({ scale, selectedNoteIndex, onNoteSelect }: Props) {
  const selectedNote = scale[selectedNoteIndex]

  // Approximate distance down the violin neck (fretless)
  const getViolinPosition = (stringMidi: number, targetMidi: number, centsOffset = 0) => {
    const diffSemitones = targetMidi - stringMidi + (centsOffset / 100)
    if (diffSemitones < 0 || diffSemitones > 8) return null // First position limits (up to one octave per string)
    
    const positionPct = (1 - Math.pow(2, -diffSemitones / 12)) * 100
    return positionPct
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          🎻 Violin Fingerboard (Fretless)
        </span>
        {selectedNote && (
          <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
            Active: {selectedNote.name}
          </span>
        )}
      </div>

      <div style={{
        position: 'relative',
        height: '140px',
        background: 'linear-gradient(to right, #3d2314, #26140a)',
        borderRadius: '12px',
        border: '2px solid rgba(212,163,95,0.3)',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
      }}>
        {/* Nut (Left border of fingerboard) */}
        <div style={{
          position: 'absolute', top: 0, left: '40px', bottom: 0,
          width: '5px', background: '#d4a35f',
          boxShadow: '0 0 6px rgba(212,163,95,0.4)', zIndex: 5
        }} />

        {/* String Labels */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: '40px',
          background: '#1a0d05', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-around', alignItems: 'center',
          borderRight: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem',
          fontWeight: 700, color: 'var(--text-muted)'
        }}>
          {VIOLIN_STRINGS.map(s => <span key={s.name}>{s.name}</span>)}
        </div>

        {/* Position markers (Common violin finger guidelines) */}
        {[
          { label: '1st Finger', pos: '15%' },
          { label: '2nd Finger', pos: '28%' },
          { label: '3rd Finger', pos: '38%' },
          { label: '4th Finger', pos: '48%' }
        ].map((m, idx) => (
          <div key={idx} style={{
            position: 'absolute', left: m.pos, top: 0, bottom: 0,
            borderLeft: '1px dashed rgba(255,255,255,0.08)', zIndex: 1,
            pointerEvents: 'none'
          }}>
            <span style={{
              position: 'absolute', bottom: '4px', left: '4px',
              fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)'
            }}>{m.label}</span>
          </div>
        ))}

        {/* String lines and note placements */}
        <div style={{
          position: 'absolute', left: '45px', right: 0, top: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-around',
          padding: '10px 0'
        }}>
          {VIOLIN_STRINGS.map((string, sIdx) => {
            const stringNotes = scale.map((note, idx) => {
              const posPct = getViolinPosition(string.midi, note.midi, note.cents)
              return { note, idx, posPct }
            }).filter(item => item.posPct !== null) as { note: Note; idx: number; posPct: number }[]

            return (
              <div key={string.name} style={{
                position: 'relative', height: '14px',
                display: 'flex', alignItems: 'center'
              }}>
                {/* Visual String line */}
                <div style={{
                  position: 'absolute', left: 0, right: 0,
                  height: `${2 - sIdx * 0.2}px`, // thin E string down to thick G
                  background: 'linear-gradient(to bottom, #e5e7eb, #9ca3af)',
                  boxShadow: '0 1px 1px rgba(0,0,0,0.5)', zIndex: 2
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
                        width: '18px', height: '18px',
                        borderRadius: '50%',
                        background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.95)',
                        border: `2px solid ${isSelected ? '#0F0805' : 'var(--primary)'}`,
                        boxShadow: isSelected ? '0 0 8px var(--primary)' : '0 1px 3px rgba(0,0,0,0.3)',
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
