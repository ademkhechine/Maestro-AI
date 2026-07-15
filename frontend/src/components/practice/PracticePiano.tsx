/**
 * PracticePiano — Synchronized piano keyboard for the Practice page.
 * Highlights the currently playing note in real-time.
 * Wide range: C3 – C6 (MIDI 48 – 84)
 */
import React, { useMemo } from 'react'

interface PracticePianoProps {
  highlightedMidi: number | null    // MIDI number of currently active note
  onKeyPress?: (midi: number) => void
}

// Build piano key layout from C3 to C6
function buildKeys(startMidi: number, endMidi: number) {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const keys: { midi: number; name: string; isBlack: boolean; step: string; octave: number }[] = []
  for (let m = startMidi; m <= endMidi; m++) {
    const semitone = m % 12
    const octave = Math.floor(m / 12) - 1
    const name = names[semitone]
    const isBlack = name.includes('#')
    keys.push({ midi: m, name: `${name}${octave}`, isBlack, step: name[0], octave })
  }
  return keys
}

const ALL_KEYS = buildKeys(48, 84) // C3 to C6
const WHITE_KEYS = ALL_KEYS.filter(k => !k.isBlack)
const BLACK_KEYS  = ALL_KEYS.filter(k => k.isBlack)

export function midiFromNote(step: string, octave: number, alter: number): number {
  const semitoneMap: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
  return 12 * (octave + 1) + (semitoneMap[step] ?? 0) + Math.round(alter)
}

export default function PracticePiano({ highlightedMidi, onKeyPress }: PracticePianoProps) {
  const whiteKeyCount = WHITE_KEYS.length
  const whiteKeyWidthPct = 100 / whiteKeyCount

  // Map MIDI to left% position (for black keys)
  const midiToLeft = useMemo(() => {
    const map: Record<number, number> = {}
    WHITE_KEYS.forEach((k, idx) => { map[k.midi] = idx })
    return map
  }, [])

  return (
    <div style={{
      position: 'relative',
      height: '90px',
      background: '#0D0A08',
      borderRadius: '0 0 12px 12px',
      borderTop: '3px solid rgba(212,163,95,0.15)',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      {/* White Keys */}
      <div style={{ display: 'flex', height: '100%' }}>
        {WHITE_KEYS.map(key => {
          const isActive = highlightedMidi === key.midi
          return (
            <div
              key={key.midi}
              onClick={() => onKeyPress?.(key.midi)}
              title={key.name}
              style={{
                flex: 1,
                background: isActive
                  ? 'linear-gradient(180deg, #D4A35F 0%, #D97706 100%)'
                  : 'linear-gradient(180deg, #FAFAF8 0%, #E8E6E2 100%)',
                border: '1px solid #1a1412',
                borderTop: 'none',
                borderRadius: '0 0 5px 5px',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: '5px',
                transition: 'background 0.06s',
                boxShadow: isActive ? '0 0 12px rgba(212,163,95,0.6) inset' : 'none'
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: '4px', background: 'rgba(217,119,6,0.9)', borderRadius: '0 0 4px 4px'
                }} />
              )}
              <span style={{
                fontSize: '0.5rem',
                fontWeight: 700,
                color: isActive ? '#5C2D00' : '#6b7280',
                lineHeight: 1
              }}>
                {key.name.includes('#') ? '' : key.name}
              </span>
            </div>
          )
        })}
      </div>

      {/* Black Keys */}
      {BLACK_KEYS.map(key => {
        const isActive = highlightedMidi === key.midi
        // Find the white key index just before this black key
        const prevWhite = WHITE_KEYS.filter(w => w.midi < key.midi)
        const prevIdx = prevWhite.length - 1
        const leftPct = (prevIdx + 1) * whiteKeyWidthPct - whiteKeyWidthPct * 0.35

        return (
          <div
            key={key.midi}
            onClick={() => onKeyPress?.(key.midi)}
            title={key.name}
            style={{
              position: 'absolute',
              top: 0,
              left: `${leftPct}%`,
              width: `${whiteKeyWidthPct * 0.6}%`,
              height: '58%',
              background: isActive
                ? 'linear-gradient(180deg, #D4A35F 0%, #D97706 100%)'
                : 'linear-gradient(180deg, #1C1410 0%, #0A0604 100%)',
              border: '1px solid #000',
              borderRadius: '0 0 4px 4px',
              zIndex: 10,
              cursor: 'pointer',
              transition: 'background 0.06s',
              boxShadow: isActive
                ? '0 0 10px rgba(212,163,95,0.7)'
                : '2px 4px 6px rgba(0,0,0,0.6)'
            }}
          />
        )
      })}
    </div>
  )
}
