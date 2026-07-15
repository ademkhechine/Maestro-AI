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

// Full range of piano keys to render (C4 to C5 - MIDI 60 to 72)
const PIANO_KEYS = [
  { midi: 60, name: 'C4', type: 'white' },
  { midi: 61, name: 'C#4', type: 'black' },
  { midi: 62, name: 'D4', type: 'white' },
  { midi: 63, name: 'D#4', type: 'black' },
  { midi: 64, name: 'E4', type: 'white' },
  { midi: 65, name: 'F4', type: 'white' },
  { midi: 66, name: 'F#4', type: 'black' },
  { midi: 67, name: 'G4', type: 'white' },
  { midi: 68, name: 'G#4', type: 'black' },
  { midi: 69, name: 'A4', type: 'white' },
  { midi: 70, name: 'A#4', type: 'black' },
  { midi: 71, name: 'B4', type: 'white' },
  { midi: 72, name: 'C5', type: 'white' }
]

export default function PianoKeyboard({ scale, selectedNoteIndex, onNoteSelect }: Props) {
  const selectedNote = scale[selectedNoteIndex]

  // Find if a piano key is part of the active scale, taking microtonality into account
  const findScaleNote = (keyMidi: number) => {
    // Standard piano keys can match our microtonal scale notes
    // E.g. E half-flat (MIDI 64 with cents = -50) matches E4 key.
    return scale.findIndex(n => n.midi === keyMidi)
  }

  const whiteKeys = PIANO_KEYS.filter(k => k.type === 'white')
  const blackKeys = PIANO_KEYS.filter(k => k.type === 'black')

  // Render layout using absolute placement to overlay black keys correctly
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          🎹 Piano Keyboard Visualizer
        </span>
        {selectedNote && (
          <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
            Note: {selectedNote.name} {selectedNote.cents ? `(${selectedNote.cents}¢)` : ''}
          </span>
        )}
      </div>

      <div style={{
        position: 'relative',
        height: '140px',
        background: '#0F0805',
        borderRadius: '10px',
        padding: '8px',
        border: '1px solid var(--border)'
      }}>
        {/* White keys */}
        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
          {whiteKeys.map(key => {
            const scaleIdx = findScaleNote(key.midi)
            const isScaleNote = scaleIdx !== -1
            const isSelected = isScaleNote && scaleIdx === selectedNoteIndex
            const note = isScaleNote ? scale[scaleIdx] : null
            const isMicrotonal = note?.cents && note.cents !== 0

            return (
              <div
                key={key.midi}
                onClick={() => isScaleNote && onNoteSelect(scaleIdx)}
                style={{
                  flex: 1,
                  background: isSelected
                    ? 'var(--primary)'
                    : isScaleNote
                      ? 'rgba(212,163,95,0.18)'
                      : '#ffffff',
                  borderRight: '1px solid #1c120c',
                  borderBottom: '1px solid #1c120c',
                  borderRadius: '0 0 4px 4px',
                  cursor: isScaleNote ? 'pointer' : 'default',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  paddingBottom: '8px',
                  transition: 'all 0.15s'
                }}
              >
                {/* Note Label */}
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: isSelected ? '#0F0805' : isScaleNote ? 'var(--primary)' : '#4b5563'
                }}>
                  {key.name}
                </span>

                {/* Microtonality badge */}
                {isMicrotonal && (
                  <div style={{
                    position: 'absolute', bottom: '24px',
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: 'var(--warning)',
                    boxShadow: '0 0 6px var(--warning)'
                  }} title="Microtonal adjusted (-50¢)" />
                )}
              </div>
            )
          })}
        </div>

        {/* Black keys overlay */}
        {/* Render black keys relative to white key width */}
        {/* There are 8 white keys in C4-C5 range. Width of each = ~12.5% */}
        {/* Black keys are placed in gaps: C-D (12.5%), D-E (25%), F-G (50%), G-A (62.5%), A-B (75%) */}
        {blackKeys.map((key, idx) => {
          const scaleIdx = findScaleNote(key.midi)
          const isScaleNote = scaleIdx !== -1
          const isSelected = isScaleNote && scaleIdx === selectedNoteIndex
          const note = isScaleNote ? scale[scaleIdx] : null
          const isMicrotonal = note?.cents && note.cents !== 0

          // Calculate correct left margin spacing offset
          // White key order: C(0), D(1), E(2), F(3), G(4), A(5), B(6), C(7)
          const offsets = [
            7.5,   // C# between C and D
            20.0,  // D# between D and E
            45.0,  // F# between F and G
            57.5,  // G# between G and A
            70.0   // A# between A and B
          ]
          const leftOffset = offsets[idx] ?? 0

          return (
            <div
              key={key.midi}
              onClick={() => isScaleNote && onNoteSelect(scaleIdx)}
              style={{
                position: 'absolute',
                top: '8px',
                left: `calc(8px + ${leftOffset}%)`,
                width: '6.5%',
                height: '60%',
                background: isSelected
                  ? 'var(--primary)'
                  : isScaleNote
                    ? 'rgba(212,163,95,0.4)'
                    : '#111827',
                border: '1px solid #000000',
                borderRadius: '0 0 3px 3px',
                cursor: isScaleNote ? 'pointer' : 'default',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: '6px',
                transition: 'all 0.15s'
              }}
            >
              <span style={{
                fontSize: '0.55rem',
                fontWeight: 800,
                color: isSelected ? '#0F0805' : isScaleNote ? 'var(--primary)' : '#9ca3af'
              }}>
                {key.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
