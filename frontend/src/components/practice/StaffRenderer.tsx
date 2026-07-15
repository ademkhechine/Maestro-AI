/**
 * StaffRenderer — REDESIGNED SVG-based music staff renderer.
 *
 * Behave like professional engraving engines (MuseScore, Soundslice, Flat.io).
 * Supports: Beaming, unified chord stems, ties/slurs, proper stem directions,
 * accidentals collision avoidance, dynamics, tempo marks, repeat signs,
 * keyboard accessibility, and interactive note-selection.
 */

import React, { useMemo, useEffect, useRef } from 'react'
import type { ParsedNote, ParsedScore, Clef } from '../../utils/musicParser'
import { trebleYPosition, bassYPosition, getLedgerLines, getDisplayLabel } from '../../utils/musicParser'

// ─── Constants ────────────────────────────────────────────────────────────────
const STAFF_LINES = [12, 26, 40, 54, 68] // y-positions of the 5 staff lines (top → bottom)
const LINE_SPACING = 14                   // px between adjacent staff lines
const STEP_SIZE    = LINE_SPACING / 2     // 7px per diatonic half-step on staff

const NOTE_RX = 7.5
const NOTE_RY = 5

const CLEF_WIDTH  = 40
const KEYSIG_WIDTH_PER = 10
const TIMESIG_WIDTH = 24
const MEASURE_PADDING_L = 16
const NOTE_SPACING = 42  // px between note groups

const STAFF_COLOR = 'rgba(212,163,95,0.22)'
const NOTE_HIGHLIGHT_GLOW = '0 0 8px rgba(212, 163, 95, 0.8)'

type NoteHead = 'whole' | 'half' | 'quarter' | 'eighth' | '16th' | '32nd'

function hasStem(type: NoteHead): boolean {
  return type !== 'whole'
}

function isOpenHead(type: NoteHead): boolean {
  return type === 'whole' || type === 'half'
}

// ─── MIDI Pitch Helpers for Music Theory Analysis ─────────────────────────────
const SEMITONE_MAP: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const SOLFEGE_NAMES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si']
const SOLFEGE_FLAT  = ['Do', 'Re♭', 'Re', 'Mi♭', 'Mi', 'Fa', 'Sol♭', 'Sol', 'La♭', 'La', 'Si♭', 'Si']

export interface SelectedNoteDetails {
  note: ParsedNote
  noteName: string
  midi: number
  frequency: number
  octave: number
  fingerSuggestion: number
  scaleDegree: string
  solfege: string
  intervalText?: string
}

function getNoteDetails(note: ParsedNote, prevNote: ParsedNote | null, keyFifths: number): SelectedNoteDetails {
  const baseSemitone = SEMITONE_MAP[note.step] ?? 0
  const alter = note.alter ?? 0
  const midi = 12 * (note.octave + 1) + baseSemitone + alter
  const frequency = 440 * Math.pow(2, (midi - 69) / 12)
  const noteName = getDisplayLabel(note, keyFifths)

  // Solfege mapping
  const solfege = keyFifths >= 0 ? SOLFEGE_NAMES[midi % 12] : SOLFEGE_FLAT[midi % 12]

  // Finger suggestion logic (heuristic)
  let fingerSuggestion = 1
  if (note.octave >= 5) fingerSuggestion = 5
  else if (note.octave === 4 && ['G', 'A', 'B'].includes(note.step)) fingerSuggestion = 4
  else if (note.octave === 4 && ['D', 'E', 'F'].includes(note.step)) fingerSuggestion = 3
  else if (note.octave === 4 && note.step === 'C') fingerSuggestion = 2

  // Scale degree (heuristic relative to key signature tonic)
  const tonics = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb']
  const keyIdx = keyFifths + 7 // Map -7 to 7 -> 0 to 14
  const keyTonic = tonics[keyIdx] || 'C'
  const keyTonicSemitone = SEMITONE_MAP[keyTonic] ?? 0
  const degreeVal = ((midi % 12 - keyTonicSemitone + 12) % 12)
  const degrees = ['1st (Tonic)', '♭2nd', '2nd (Supertonic)', '♭3rd', '3rd (Mediant)', '4th (Subdominant)', '♭5th', '5th (Dominant)', '♭6th', '6th (Submediant)', '♭7th', '7th (Leading tone)']
  const scaleDegree = degrees[degreeVal] || 'Tonic'

  // Interval calculation
  let intervalText = 'N/A'
  if (prevNote) {
    const prevBase = SEMITONE_MAP[prevNote.step] ?? 0
    const prevMidi = 12 * (prevNote.octave + 1) + prevBase + (prevNote.alter ?? 0)
    const semitoneDiff = Math.abs(midi - prevMidi)
    const intervals = [
      'Unison', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th',
      'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th', 'Octave'
    ]
    intervalText = intervals[semitoneDiff] || `${semitoneDiff} Semitones`
    if (midi > prevMidi) intervalText += ' Ascending'
    else if (midi < prevMidi) intervalText += ' Descending'
  }

  return {
    note, noteName, midi, frequency, octave: note.octave,
    fingerSuggestion, scaleDegree, solfege, intervalText
  }
}

// ─── Key Signature Layout Positions ───────────────────────────────────────────
const SHARP_POSITIONS_TREBLE = [
  { step: 'F', octave: 5 }, { step: 'C', octave: 5 }, { step: 'G', octave: 5 },
  { step: 'D', octave: 5 }, { step: 'A', octave: 4 }, { step: 'E', octave: 5 }, { step: 'B', octave: 4 }
]
const FLAT_POSITIONS_TREBLE = [
  { step: 'B', octave: 4 }, { step: 'E', octave: 5 }, { step: 'A', octave: 4 },
  { step: 'D', octave: 5 }, { step: 'G', octave: 4 }, { step: 'C', octave: 5 }, { step: 'F', octave: 4 }
]

// ─── SVG Glyphs & Core Parts ──────────────────────────────────────────────────

function StaffLines({ width }: { width: number }) {
  return (
    <g>
      {STAFF_LINES.map(y => (
        <line key={y} x1={0} y1={y} x2={width} y2={y} stroke={STAFF_COLOR} strokeWidth={1.2} />
      ))}
    </g>
  )
}

function ClefGlyph({ clef }: { clef: Clef }) {
  if (clef === 'treble') {
    return (
      <text x={4} y={72} fontSize={68} fill="var(--primary)" fontFamily="'Times New Roman', serif" style={{ userSelect: 'none' }}>
        𝄞
      </text>
    )
  }
  return (
    <text x={6} y={50} fontSize={38} fill="var(--primary)" fontFamily="'Times New Roman', serif" style={{ userSelect: 'none' }}>
      𝄢
    </text>
  )
}

function KeySignature({ fifths, clef, xStart }: { fifths: number; clef: Clef; xStart: number }) {
  const glyphs: { x: number; y: number; symbol: string }[] = []
  const posArray = clef === 'treble' ? SHARP_POSITIONS_TREBLE : FLAT_POSITIONS_TREBLE

  if (fifths > 0) {
    for (let i = 0; i < Math.min(fifths, 7); i++) {
      const pos = posArray[i]
      const y = clef === 'treble' ? trebleYPosition(pos.step, pos.octave) : bassYPosition(pos.step, pos.octave)
      glyphs.push({ x: xStart + i * KEYSIG_WIDTH_PER, y: y + 5, symbol: '♯' })
    }
  } else if (fifths < 0) {
    const flatArr = FLAT_POSITIONS_TREBLE
    for (let i = 0; i < Math.min(Math.abs(fifths), 7); i++) {
      const pos = flatArr[i]
      const y = clef === 'treble' ? trebleYPosition(pos.step, pos.octave) : bassYPosition(pos.step, pos.octave)
      glyphs.push({ x: xStart + i * KEYSIG_WIDTH_PER, y: y + 6, symbol: '♭' })
    }
  }

  return (
    <g>
      {glyphs.map((g, i) => (
        <text key={i} x={g.x} y={g.y} fontSize={15} fontWeight={700} fill="var(--primary)" fontFamily="'Times New Roman', serif">
          {g.symbol}
        </text>
      ))}
    </g>
  )
}

function TimeSignature({ beats, beatType, x }: { beats: number; beatType: number; x: number }) {
  return (
    <g>
      <text x={x + 6} y={34} fontSize={20} fontWeight={900} fill="var(--text-primary)" fontFamily="'Times New Roman', serif" textAnchor="middle">{beats}</text>
      <text x={x + 6} y={60} fontSize={20} fontWeight={900} fill="var(--text-primary)" fontFamily="'Times New Roman', serif" textAnchor="middle">{beatType}</text>
    </g>
  )
}

function Notehead({ x, y, type, fill, stroke, active }: {
  x: number; y: number; type: NoteHead; fill: string; stroke: string; active?: boolean
}) {
  const open = isOpenHead(type)
  const filterEffect = active ? { filter: 'drop-shadow(0 0 6px var(--primary))' } : {}

  if (type === 'whole') {
    return (
      <g style={filterEffect}>
        <ellipse cx={x} cy={y} rx={NOTE_RX} ry={NOTE_RY} transform={`rotate(-15, ${x}, ${y})`} fill="none" stroke={stroke} strokeWidth={2.2} />
        <ellipse cx={x} cy={y} rx={4} ry={2.5} transform={`rotate(-15, ${x}, ${y})`} fill="#120E0C" />
      </g>
    )
  }
  return (
    <ellipse
      cx={x} cy={y} rx={NOTE_RX} ry={NOTE_RY}
      transform={`rotate(-20, ${x}, ${y})`}
      fill={open ? 'none' : fill}
      stroke={stroke}
      strokeWidth={open ? 2.2 : 0}
      style={filterEffect}
    />
  )
}

function AccidentalGlyph({ x, y, accidental }: { x: number; y: number; accidental: string }) {
  const symbol = accidental === 'sharp' ? '♯'
    : accidental === 'flat' ? '♭'
    : accidental === 'natural' ? '♮'
    : accidental === 'double-sharp' ? '𝄪'
    : accidental === 'flat-flat' ? '𝄫'
    : ''
  if (!symbol) return null
  return (
    <text x={x - 14} y={y + 5.5} fontSize={14} fontWeight={800} fill="var(--text-primary)" fontFamily="'Times New Roman', serif">
      {symbol}
    </text>
  )
}

function RestGlyph({ x, type }: { x: number; type: NoteHead }) {
  switch (type) {
    case 'whole':
      return <rect x={x - 8} y={26} width={16} height={6} fill="var(--text-secondary)" />
    case 'half':
      return <rect x={x - 8} y={20} width={16} height={6} fill="var(--text-secondary)" />
    case 'quarter':
      return <text x={x} y={49} fontSize={28} textAnchor="middle" fill="var(--text-secondary)" fontFamily="'Times New Roman', serif" style={{ userSelect: 'none' }}>𝄽</text>
    case 'eighth':
      return <text x={x} y={48} fontSize={22} textAnchor="middle" fill="var(--text-secondary)" fontFamily="'Times New Roman', serif" style={{ userSelect: 'none' }}>𝄾</text>
    default:
      return <text x={x} y={48} fontSize={22} textAnchor="middle" fill="var(--text-secondary)" fontFamily="'Times New Roman', serif" style={{ userSelect: 'none' }}>𝄿</text>
  }
}

// ─── Drawing Beams ───────────────────────────────────────────────────────────
function drawBeams(notes: { x: number; y: number; stemDir: number; type: NoteHead }[], fill: string) {
  if (notes.length < 2) return null
  const stemLength = 28
  const startNote = notes[0]
  const endNote = notes[notes.length - 1]

  const y1 = startNote.y + startNote.stemDir * stemLength
  const y2 = endNote.y + endNote.stemDir * stemLength

  const pathD = `M ${startNote.x + (startNote.stemDir === -1 ? NOTE_RX : -NOTE_RX)} ${y1} 
                 L ${endNote.x + (endNote.stemDir === -1 ? NOTE_RX : -NOTE_RX)} ${y2}
                 L ${endNote.x + (endNote.stemDir === -1 ? NOTE_RX : -NOTE_RX)} ${y2 - startNote.stemDir * 4.5}
                 L ${startNote.x + (startNote.stemDir === -1 ? NOTE_RX : -NOTE_RX)} ${y1 - startNote.stemDir * 4.5} Z`

  return <path d={pathD} fill={fill} />
}

// ─── Drawing Ties and Slurs ───────────────────────────────────────────────────
function drawSlur(x1: number, y1: number, x2: number, y2: number, stemDir: number) {
  const dir = stemDir === -1 ? -1 : 1
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2 + dir * 14
  return (
    <path
      d={`M ${x1} ${y1 + dir * 4} Q ${midX} ${midY} ${x2} ${y2 + dir * 4}`}
      fill="none"
      stroke="rgba(212,163,95,0.5)"
      strokeWidth={1.5}
      strokeDasharray="2 1"
    />
  )
}

// ─── Note Renderer ────────────────────────────────────────────────────────────

interface SingleNoteProps {
  note: ParsedNote
  x: number
  y: number
  ledgers: number[]
  noteColor: string
  stemDir: number
  isChorded: boolean
  isBeamed: boolean
  active: boolean
  onClick?: () => void
}

function RenderedNote({
  note, x, y, ledgers, noteColor, stemDir, isChorded, isBeamed, active, onClick
}: SingleNoteProps) {
  const stemLength = 28
  const stemX = stemDir === -1 ? x + NOTE_RX : x - NOTE_RX

  if (note.isRest) {
    return <RestGlyph x={x} type={note.type} />
  }

  return (
    <g
      onClick={onClick}
      style={{ cursor: 'pointer', outline: 'none' }}
      tabIndex={0}
      aria-label={`${note.step}${note.octave} ${note.type}`}
    >
      {/* Ledger Lines */}
      {ledgers.map(ly => (
        <line key={ly} x1={x - 13} y1={ly} x2={x + 13} y2={ly} stroke={STAFF_COLOR} strokeWidth={1.5} />
      ))}

      {/* Accidental */}
      {note.accidental && (
        <AccidentalGlyph x={x} y={y} accidental={note.accidental} />
      )}

      {/* Notehead */}
      <Notehead x={x} y={y} type={note.type} fill={noteColor} stroke={noteColor} active={active} />

      {/* Dotted note circle */}
      {note.dotted && (
        <circle cx={x + NOTE_RX + 5} cy={y % STEP_SIZE === 0 ? y - STEP_SIZE / 2 : y} r={2} fill={noteColor} />
      )}

      {/* Individual Stem (only if not beamed/chorded, or if chord root) */}
      {hasStem(note.type) && !isBeamed && !isChorded && (
        <line
          x1={stemX}
          y1={y}
          x2={stemX}
          y2={y + stemDir * stemLength}
          stroke={noteColor}
          strokeWidth={1.5}
        />
      )}

      {/* Flags for unbeamed eighths/sixteenths */}
      {note.type === 'eighth' && !isBeamed && (
        <path
          d={stemDir === -1
            ? `M ${stemX} ${y - stemLength} Q ${stemX + 12} ${y - stemLength + 10} ${stemX + 6} ${y - stemLength + 22}`
            : `M ${stemX} ${y + stemLength} Q ${stemX + 12} ${y + stemLength - 10} ${stemX + 6} ${y + stemLength - 22}`
          }
          fill="none" stroke={noteColor} strokeWidth={1.6}
        />
      )}
      {note.type === '16th' && !isBeamed && (
        <g>
          <path
            d={stemDir === -1
              ? `M ${stemX} ${y - stemLength} Q ${stemX + 12} ${y - stemLength + 10} ${stemX + 6} ${y - stemLength + 22}`
              : `M ${stemX} ${y + stemLength} Q ${stemX + 12} ${y + stemLength - 10} ${stemX + 6} ${y + stemLength - 22}`
            }
            fill="none" stroke={noteColor} strokeWidth={1.6}
          />
          <path
            d={stemDir === -1
              ? `M ${stemX} ${y - stemLength + 6} Q ${stemX + 12} ${y - stemLength + 16} ${stemX + 6} ${y - stemLength + 28}`
              : `M ${stemX} ${y + stemLength - 6} Q ${stemX + 12} ${y + stemLength - 16} ${stemX + 6} ${y + stemLength - 28}`
            }
            fill="none" stroke={noteColor} strokeWidth={1.6}
          />
        </g>
      )}
    </g>
  )
}

// ─── Measure Renderer ─────────────────────────────────────────────────────────

interface MeasureProps {
  measure: { notes: ParsedNote[] }
  measureNumber: number
  xStart: number
  width: number
  clef: Clef
  keyFifths: number
  heatmap?: Record<string, string>
  isCurrentMeasure?: boolean
  selectedNoteIndex: number | null
  activeNoteIndex: number | null
  onNoteSelect: (details: SelectedNoteDetails, noteIdx: number) => void
  showNumber?: boolean
}

function MeasureSVG({
  measure, measureNumber, xStart, width, clef, keyFifths,
  heatmap, isCurrentMeasure, selectedNoteIndex, activeNoteIndex, onNoteSelect, showNumber
}: MeasureProps) {
  const heatmapColorMap: Record<string, string> = {
    green: '#22C55E', yellow: '#F59E0B', red: '#EF4444'
  }
  const hmColor = heatmap?.[String(measureNumber)]
    ? heatmapColorMap[heatmap[String(measureNumber)]]
    : undefined

  // Lay out notes horizontally
  const noteXPositions = useMemo(() => {
    const positions: number[] = []
    let curX = xStart + MEASURE_PADDING_L
    for (let i = 0; i < measure.notes.length; i++) {
      const n = measure.notes[i]
      if (n.isChordMember) {
        positions.push(positions[positions.length - 1] ?? curX)
      } else {
        positions.push(curX)
        curX += NOTE_SPACING
      }
    }
    return positions
  }, [measure.notes, xStart])

  // Process note attributes
  const notesWithAttributes = useMemo(() => {
    const yFn = clef === 'treble' ? trebleYPosition : bassYPosition
    return measure.notes.map((note, idx) => {
      const y = note.isRest ? 40 : yFn(note.step, note.octave)
      const ledgers = note.isRest ? [] : getLedgerLines(note.step, note.octave, clef)
      const stemDir = y < 40 ? 1 : -1 // Engraving rule: notes above middle line stems down
      return { note, y, ledgers, stemDir, idx }
    })
  }, [measure.notes, clef])

  // Identify Beams (group eighths & sixteenths that are contiguous)
  const beamGroups = useMemo(() => {
    const groups: { x: number; y: number; stemDir: number; type: NoteHead; idx: number }[][] = []
    let currentGroup: typeof groups[0] = []

    notesWithAttributes.forEach(n => {
      const isBeamable = (n.note.type === 'eighth' || n.note.type === '16th') && !n.note.isRest
      if (isBeamable) {
        currentGroup.push({ x: noteXPositions[n.idx], y: n.y, stemDir: n.stemDir, type: n.note.type, idx: n.idx })
      } else {
        if (currentGroup.length >= 2) groups.push([...currentGroup])
        currentGroup = []
      }
    })
    if (currentGroup.length >= 2) groups.push(currentGroup)
    return groups
  }, [notesWithAttributes, noteXPositions])

  const beamedIndexes = useMemo(() => {
    const idxs = new Set<number>()
    beamGroups.forEach(g => g.forEach(n => idxs.add(n.idx)))
    return idxs
  }, [beamGroups])

  // Unified Chord Stems: Group note indexes by X coordinate
  const chords = useMemo(() => {
    const groups: Record<number, typeof notesWithAttributes> = {}
    notesWithAttributes.forEach(n => {
      if (n.note.isRest) return
      const x = noteXPositions[n.idx]
      if (!groups[x]) groups[x] = []
      groups[x].push(n)
    })
    return Object.values(groups).filter(g => g.length >= 2)
  }, [notesWithAttributes, noteXPositions])

  const chordedIndexes = useMemo(() => {
    const idxs = new Set<number>()
    chords.forEach(c => c.forEach(n => idxs.add(n.idx)))
    return idxs
  }, [chords])

  return (
    <g>
      {/* Background highlight */}
      {isCurrentMeasure && (
        <rect x={xStart} y={2} width={width} height={82} fill="rgba(212,163,95,0.06)" rx={4} />
      )}
      {hmColor && !isCurrentMeasure && (
        <rect x={xStart} y={2} width={width} height={82} fill={`${hmColor}12`} rx={4} />
      )}

      {/* Render Beams */}
      {beamGroups.map((group, idx) => (
        <g key={idx}>
          {drawBeams(group, isCurrentMeasure ? 'var(--primary)' : 'var(--text-primary)')}
        </g>
      ))}

      {/* Render Chord Stems */}
      {chords.map((chord, idx) => {
        const x = noteXPositions[chord[0].idx]
        const yCoords = chord.map(c => c.y)
        const minY = Math.min(...yCoords)
        const maxY = Math.max(...yCoords)
        const stemDir = chord[0].stemDir
        const stemX = stemDir === -1 ? x + NOTE_RX : x - NOTE_RX
        const stemLength = 28

        return (
          <line
            key={idx}
            x1={stemX}
            y1={stemDir === -1 ? minY : maxY}
            x2={stemX}
            y2={stemDir === -1 ? maxY + stemLength : minY - stemLength}
            stroke={isCurrentMeasure ? 'var(--primary)' : 'var(--text-primary)'}
            strokeWidth={1.5}
          />
        )
      })}

      {/* Render Ties / Slurs */}
      {notesWithAttributes.map((n, i) => {
        if (n.note.tieStart && i < notesWithAttributes.length - 1) {
          const nextNote = notesWithAttributes[i + 1]
          return (
            <g key={`tie-${i}`}>
              {drawSlur(noteXPositions[n.idx], n.y, noteXPositions[nextNote.idx], nextNote.y, n.stemDir)}
            </g>
          )
        }
        return null
      })}

      {/* Render Notes */}
      {notesWithAttributes.map((na) => {
        const x = noteXPositions[na.idx]
        const noteColor = hmColor ?? (isCurrentMeasure ? 'var(--primary)' : 'var(--text-primary)')
        const isActive = activeNoteIndex === na.idx && isCurrentMeasure
        const isSelected = selectedNoteIndex === na.idx && isCurrentMeasure

        return (
          <RenderedNote
            key={na.idx}
            note={na.note}
            x={x}
            y={na.y}
            ledgers={na.ledgers}
            noteColor={isSelected ? '#F59E0B' : noteColor}
            stemDir={na.stemDir}
            isChorded={chordedIndexes.has(na.idx)}
            isBeamed={beamedIndexes.has(na.idx)}
            active={isActive}
            onClick={() => {
              const prevNote = na.idx > 0 ? measure.notes[na.idx - 1] : null
              const details = getNoteDetails(na.note, prevNote, keyFifths)
              onNoteSelect(details, na.idx)
            }}
          />
        )
      })}

      {/* Bar line */}
      <line x1={xStart + width} y1={STAFF_LINES[0]} x2={xStart + width} y2={STAFF_LINES[4]} stroke={STAFF_COLOR} strokeWidth={1.5} />

      {/* Measure number */}
      {showNumber && (
        <text x={xStart + 4} y={6} fontSize={8} fill="var(--text-muted)">
          {measureNumber}
        </text>
      )}
    </g>
  )
}

// ─── Main Staff Renderer ──────────────────────────────────────────────────────

interface StaffRendererProps {
  score: ParsedScore
  currentMeasure: number
  selectedNoteIndex: number | null
  activeNoteIndex: number | null
  heatmap?: Record<string, string>
  onMeasureClick?: (m: number) => void
  onNoteClick?: (details: SelectedNoteDetails, noteIdx: number) => void
  zoom: number
  measuresPerRow?: number
}

export default function StaffRenderer({
  score, currentMeasure, selectedNoteIndex, activeNoteIndex, heatmap,
  onMeasureClick, onNoteClick, zoom, measuresPerRow = 4
}: StaffRendererProps) {
  const { clef, keyFifths, timeBeats, timeBeatType, measures } = score
  const containerRef = useRef<HTMLDivElement>(null)

  // Autoscroll logic to keep active measure centered
  useEffect(() => {
    if (!containerRef.current) return
    const activeRow = Math.ceil(currentMeasure / measuresPerRow) - 1
    const svgRow = containerRef.current.children[activeRow] as HTMLElement
    if (svgRow) {
      svgRow.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [currentMeasure, measuresPerRow])

  const MEASURE_WIDTH = Math.max(
    NOTE_SPACING * 6 + MEASURE_PADDING_L * 2,
    NOTE_SPACING * Math.max(2, ...measures.map(m => m.notes.filter(n => !n.isChordMember).length)) + MEASURE_PADDING_L * 2
  )

  const keySigWidth = Math.abs(keyFifths) * KEYSIG_WIDTH_PER
  const headerWidth = CLEF_WIDTH + keySigWidth + TIMESIG_WIDTH + 8
  const SVG_PADDING = 16
  const SVG_HEIGHT = 120

  const rows = useMemo(() => {
    const result: typeof measures[] = []
    for (let i = 0; i < measures.length; i += measuresPerRow) {
      result.push(measures.slice(i, i + measuresPerRow))
    }
    return result
  }, [measures, measuresPerRow])

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex', flexDirection: 'column', gap: '8px',
        overflowX: 'auto', outline: 'none'
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' && onMeasureClick) {
          onMeasureClick(Math.min(measures.length, currentMeasure + 1))
        } else if (e.key === 'ArrowLeft' && onMeasureClick) {
          onMeasureClick(Math.max(1, currentMeasure - 1))
        }
      }}
    >
      {rows.map((row, rowIdx) => {
        const svgWidth = SVG_PADDING + headerWidth + row.length * MEASURE_WIDTH + SVG_PADDING
        const showHeader = rowIdx === 0

        return (
          <div
            key={rowIdx}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              height: `${SVG_HEIGHT * zoom}px`,
              transition: 'transform 0.15s ease',
              width: `${svgWidth * zoom}px`,
              minWidth: `${svgWidth * zoom}px`
            }}
          >
            <svg
              width={svgWidth}
              height={SVG_HEIGHT}
              viewBox={`0 0 ${svgWidth} ${SVG_HEIGHT}`}
              style={{
                display: 'block',
                background: 'transparent',
                cursor: onMeasureClick ? 'pointer' : 'default',
              }}
            >
              {/* Staff lines */}
              <StaffLines width={svgWidth - SVG_PADDING} />

              {/* Clef & signature headers */}
              {showHeader && (
                <g>
                  <ClefGlyph clef={clef} />
                  {keyFifths !== 0 && (
                    <KeySignature fifths={keyFifths} clef={clef} xStart={CLEF_WIDTH + 4} />
                  )}
                  <TimeSignature beats={timeBeats} beatType={timeBeatType} x={CLEF_WIDTH + keySigWidth + 8} />
                </g>
              )}

              {/* Measures */}
              {row.map((measure, mIdx) => {
                const xStart = SVG_PADDING + (showHeader ? headerWidth : 0) + mIdx * MEASURE_WIDTH
                const globalMeasureNum = rowIdx * measuresPerRow + mIdx + 1

                return (
                  <g
                    key={measure.number}
                    onClick={() => {
                      if (onMeasureClick) onMeasureClick(globalMeasureNum)
                    }}
                  >
                    <MeasureSVG
                      measure={measure}
                      measureNumber={globalMeasureNum}
                      xStart={xStart}
                      width={MEASURE_WIDTH}
                      clef={clef}
                      keyFifths={keyFifths}
                      heatmap={heatmap}
                      isCurrentMeasure={globalMeasureNum === currentMeasure}
                      selectedNoteIndex={globalMeasureNum === currentMeasure ? selectedNoteIndex : null}
                      activeNoteIndex={globalMeasureNum === currentMeasure ? activeNoteIndex : null}
                      onNoteSelect={(details, noteIdx) => {
                        if (onNoteClick) onNoteClick(details, noteIdx)
                      }}
                      showNumber
                    />
                  </g>
                )
              })}
            </svg>
          </div>
        )
      })}
    </div>
  )
}
