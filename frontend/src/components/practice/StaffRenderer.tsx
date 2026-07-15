/**
 * StaffRenderer — Proper SVG-based music staff renderer.
 *
 * Coordinate System (all in SVG user units):
 *   - Staff area: y = 12 (top line F5) to y = 68 (bottom line E4) in treble clef
 *   - Line spacing: 14px per diatonic step, 7px per diatonic step between consecutive lines
 *   - Staff lines at: y = 12, 26, 40, 54, 68  (every 14px)
 *   - Spaces at: y = 19, 33, 47, 61
 *   - Middle C ledger at: y = 82 (one ledger line below bottom line in treble)
 */

import { useMemo } from 'react'
import { Volume2 } from 'lucide-react'
import type { ParsedNote, ParsedScore, Clef } from '../../utils/musicParser'
import { trebleYPosition, bassYPosition, getLedgerLines, getDisplayLabel } from '../../utils/musicParser'

// ─── Constants ────────────────────────────────────────────────────────────────
const STAFF_LINES = [12, 26, 40, 54, 68] // y-positions of the 5 staff lines (top → bottom)
const LINE_SPACING = 14                   // px between adjacent staff lines
const STEP_SIZE    = LINE_SPACING / 2     // 7px per diatonic half-step on staff

// Note head size
const NOTE_RX = 7.5
const NOTE_RY = 5

// Treble clef glyph x start, width reserve
const CLEF_WIDTH  = 36
const KEYSIG_WIDTH_PER = 10
const TIMESIG_WIDTH = 20
const MEASURE_PADDING_L = 12
const NOTE_SPACING = 38  // px between note groups

// Colors
const STAFF_COLOR = 'rgba(212,163,95,0.25)'

// ─── Note Duration Geometry ───────────────────────────────────────────────────
const OPEN_HEADS: NoteHead[] = ['whole', 'half']
type NoteHead = 'whole' | 'half' | 'quarter' | 'eighth' | '16th' | '32nd'

function hasStem(type: NoteHead): boolean {
  return type !== 'whole'
}
function isOpenHead(type: NoteHead): boolean {
  return OPEN_HEADS.includes(type)
}

// ─── Key Signature Helpers ────────────────────────────────────────────────────
const SHARP_POSITIONS_TREBLE = [
  { step: 'F', octave: 5 }, // F#
  { step: 'C', octave: 5 }, // C#
  { step: 'G', octave: 5 }, // G#
  { step: 'D', octave: 5 }, // D#
  { step: 'A', octave: 4 }, // A#
  { step: 'E', octave: 5 }, // E#
  { step: 'B', octave: 4 }, // B#
]
const FLAT_POSITIONS_TREBLE = [
  { step: 'B', octave: 4 }, // Bb
  { step: 'E', octave: 5 }, // Eb
  { step: 'A', octave: 4 }, // Ab
  { step: 'D', octave: 5 }, // Db
  { step: 'G', octave: 4 }, // Gb
  { step: 'C', octave: 5 }, // Cb
  { step: 'F', octave: 4 }, // Fb
]

// ─── SVG Components ───────────────────────────────────────────────────────────

function StaffLines({ width }: { width: number }) {
  return (
    <g>
      {STAFF_LINES.map(y => (
        <line key={y} x1={0} y1={y} x2={width} y2={y} stroke={STAFF_COLOR} strokeWidth={1.2} />
      ))}
    </g>
  )
}

function TrebleClef() {
  // Unicode treble clef rendered as SVG text — properly sized and positioned
  return (
    <text
      x={4} y={74}
      fontSize={68}
      fill="var(--primary)"
      fontFamily="'Times New Roman', serif"
      style={{ userSelect: 'none', letterSpacing: 0 }}
    >
      𝄞
    </text>
  )
}

function BassClef() {
  return (
    <text
      x={8} y={52}
      fontSize={38}
      fill="var(--primary)"
      fontFamily="'Times New Roman', serif"
      style={{ userSelect: 'none' }}
    >
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
      glyphs.push({ x: xStart + i * KEYSIG_WIDTH_PER, y: y + 5, symbol: '#' })
    }
  } else if (fifths < 0) {
    const flatArr = FLAT_POSITIONS_TREBLE
    for (let i = 0; i < Math.min(Math.abs(fifths), 7); i++) {
      const pos = flatArr[i]
      const y = clef === 'treble' ? trebleYPosition(pos.step, pos.octave) : bassYPosition(pos.step, pos.octave)
      glyphs.push({ x: xStart + i * KEYSIG_WIDTH_PER, y: y + 7, symbol: '♭' })
    }
  }

  return (
    <g>
      {glyphs.map((g, i) => (
        <text key={i} x={g.x} y={g.y} fontSize={14} fontWeight={700}
          fill="var(--primary)" fontFamily="'Times New Roman', serif">
          {g.symbol}
        </text>
      ))}
    </g>
  )
}

function TimeSignature({ beats, beatType, x }: { beats: number; beatType: number; x: number }) {
  return (
    <g>
      <text x={x + 4} y={36} fontSize={18} fontWeight={900} fill="var(--text-primary)"
        fontFamily="'Times New Roman', serif" textAnchor="middle">{beats}</text>
      <text x={x + 4} y={62} fontSize={18} fontWeight={900} fill="var(--text-primary)"
        fontFamily="'Times New Roman', serif" textAnchor="middle">{beatType}</text>
    </g>
  )
}

function Notehead({ x, y, type, fill, stroke }: {
  x: number; y: number; type: NoteHead
  fill: string; stroke: string
}) {
  const open = isOpenHead(type)
  if (type === 'whole') {
    return (
      <g>
        <ellipse cx={x} cy={y} rx={NOTE_RX} ry={NOTE_RY}
          transform={`rotate(-15, ${x}, ${y})`}
          fill="none" stroke={stroke} strokeWidth={2} />
        {/* Whole note inner void */}
        <ellipse cx={x} cy={y} rx={4} ry={3}
          transform={`rotate(-15, ${x}, ${y})`}
          fill={fill} />
      </g>
    )
  }
  return (
    <ellipse cx={x} cy={y} rx={NOTE_RX} ry={NOTE_RY}
      transform={`rotate(-20, ${x}, ${y})`}
      fill={open ? 'none' : fill}
      stroke={stroke}
      strokeWidth={open ? 2 : 0}
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
    <text x={x - 13} y={y + 5} fontSize={13} fontWeight={700}
      fill="var(--text-primary)" fontFamily="'Times New Roman', serif">
      {symbol}
    </text>
  )
}

function Dot({ x, y }: { x: number; y: number }) {
  const dotY = y % STEP_SIZE === 0 ? y - STEP_SIZE / 2 : y
  return <circle cx={x + NOTE_RX + 5} cy={dotY} r={2.5} fill="var(--text-primary)" />
}

function RestGlyph({ x, type }: { x: number; type: NoteHead }) {
  switch (type) {
    case 'whole':
      return <rect x={x - 8} y={26} width={16} height={7} rx={1} fill="var(--text-secondary)" />
    case 'half':
      return <rect x={x - 8} y={33} width={16} height={7} rx={1} fill="none" stroke="var(--text-secondary)" strokeWidth={2} />
    case 'quarter':
      return <text x={x} y={52} fontSize={28} textAnchor="middle" fill="var(--text-secondary)"
        fontFamily="'Times New Roman', serif">𝄽</text>
    case 'eighth':
      return <text x={x} y={52} fontSize={22} textAnchor="middle" fill="var(--text-secondary)"
        fontFamily="'Times New Roman', serif">𝄾</text>
    default:
      return <text x={x} y={52} fontSize={22} textAnchor="middle" fill="var(--text-secondary)"
        fontFamily="'Times New Roman', serif">𝄿</text>
  }
}

function SingleNote({ note, x, clef, keyFifths, heatmapColor, highlight }: {
  note: ParsedNote
  x: number
  clef: Clef
  keyFifths: number
  heatmapColor?: string
  highlight?: boolean
}) {
  const yFn = clef === 'treble' ? trebleYPosition : bassYPosition
  const y = note.isRest ? 40 : yFn(note.step, note.octave)
  const ledgers = note.isRest ? [] : getLedgerLines(note.step, note.octave, clef)

  const noteColor = heatmapColor ?? (highlight ? 'var(--primary)' : 'var(--text-primary)')
  const stemDir = y < 40 ? 1 : -1 // stem goes down when note is above middle line
  const stemLength = 30

  if (note.isRest) {
    return <RestGlyph x={x} type={note.type} />
  }

  return (
    <g>
      {/* Ledger lines */}
      {ledgers.map(ly => (
        <line key={ly} x1={x - 12} y1={ly} x2={x + 12} y2={ly}
          stroke={STAFF_COLOR} strokeWidth={1.5} />
      ))}

      {/* Accidental */}
      {note.accidental && (
        <AccidentalGlyph x={x} y={y} accidental={note.accidental} />
      )}

      {/* Notehead */}
      <Notehead x={x} y={y} type={note.type} fill={noteColor} stroke={noteColor} />

      {/* Dot */}
      {note.dotted && <Dot x={x} y={y} />}

      {/* Stem */}
      {hasStem(note.type) && (
        <line
          x1={stemDir === -1 ? x + NOTE_RX : x - NOTE_RX}
          y1={y}
          x2={stemDir === -1 ? x + NOTE_RX : x - NOTE_RX}
          y2={y + stemDir * stemLength}
          stroke={noteColor} strokeWidth={1.6}
        />
      )}

      {/* Flag for eighth notes */}
      {(note.type === 'eighth' || note.type === '16th') && !note.isChordMember && (
        <path
          d={stemDir === -1
            ? `M ${x + NOTE_RX} ${y - stemLength} Q ${x + NOTE_RX + 16} ${y - stemLength + 10} ${x + NOTE_RX + 8} ${y - stemLength + 22}`
            : `M ${x - NOTE_RX} ${y + stemLength} Q ${x - NOTE_RX + 16} ${y + stemLength - 10} ${x - NOTE_RX + 8} ${y + stemLength - 22}`
          }
          fill="none" stroke={noteColor} strokeWidth={1.8}
        />
      )}
      {note.type === '16th' && !note.isChordMember && (
        <path
          d={stemDir === -1
            ? `M ${x + NOTE_RX} ${y - stemLength + 10} Q ${x + NOTE_RX + 16} ${y - stemLength + 20} ${x + NOTE_RX + 8} ${y - stemLength + 32}`
            : `M ${x - NOTE_RX} ${y + stemLength - 10} Q ${x - NOTE_RX + 16} ${y + stemLength - 20} ${x - NOTE_RX + 8} ${y + stemLength - 32}`
          }
          fill="none" stroke={noteColor} strokeWidth={1.8}
        />
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
  showNumber?: boolean
}

function MeasureSVG({
  measure, measureNumber, xStart, width, clef, keyFifths,
  heatmap, isCurrentMeasure, showNumber
}: MeasureProps) {
  const heatmapColorMap: Record<string, string> = {
    green: '#22C55E', yellow: '#F59E0B', red: '#EF4444'
  }
  const hmColor = heatmap?.[String(measureNumber)]
    ? heatmapColorMap[heatmap[String(measureNumber)]]
    : undefined

  // Lay out notes left → right within measure
  const noteXPositions: number[] = []
  let curX = xStart + MEASURE_PADDING_L
  for (let i = 0; i < measure.notes.length; i++) {
    const n = measure.notes[i]
    if (n.isChordMember) {
      noteXPositions.push(noteXPositions[noteXPositions.length - 1] ?? curX)
    } else {
      noteXPositions.push(curX)
      curX += NOTE_SPACING
    }
  }

  return (
    <g>
      {/* Highlight current measure background */}
      {isCurrentMeasure && (
        <rect x={xStart} y={2} width={width} height={82}
          fill="rgba(212,163,95,0.06)" rx={4} />
      )}

      {/* Heatmap measure background */}
      {hmColor && !isCurrentMeasure && (
        <rect x={xStart} y={2} width={width} height={82}
          fill={`${hmColor}18`} rx={4} />
      )}

      {/* Notes */}
      {measure.notes.map((note, i) => (
        <SingleNote
          key={i}
          note={note}
          x={noteXPositions[i]}
          clef={clef}
          keyFifths={keyFifths}
          heatmapColor={hmColor}
          highlight={isCurrentMeasure}
        />
      ))}

      {/* Bar line */}
      <line x1={xStart + width} y1={STAFF_LINES[0]} x2={xStart + width} y2={STAFF_LINES[4]}
        stroke={STAFF_COLOR} strokeWidth={1.5} />

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
  heatmap?: Record<string, string>
  onMeasureClick?: (m: number) => void
  measuresPerRow?: number
}

export default function StaffRenderer({
  score, currentMeasure, heatmap, onMeasureClick, measuresPerRow = 4
}: StaffRendererProps) {
  const { clef, keyFifths, timeBeats, timeBeatType, measures } = score

  // Calculate fixed measure width and SVG dimensions
  const MEASURE_WIDTH = Math.max(
    NOTE_SPACING * 6 + MEASURE_PADDING_L * 2,
    NOTE_SPACING * Math.max(2, ...measures.slice(0, 5).map(m => m.notes.filter(n => !n.isChordMember).length)) + MEASURE_PADDING_L * 2
  )

  const keySigWidth = Math.abs(keyFifths) * KEYSIG_WIDTH_PER
  const headerWidth = CLEF_WIDTH + keySigWidth + TIMESIG_WIDTH + 8
  const SVG_PADDING = 16
  const SVG_HEIGHT = 120 // includes some space above/below staff for ledger lines

  const rows = useMemo(() => {
    const result: typeof measures[] = []
    for (let i = 0; i < measures.length; i += measuresPerRow) {
      result.push(measures.slice(i, i + measuresPerRow))
    }
    return result
  }, [measures, measuresPerRow])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', overflowX: 'auto' }}>
      {rows.map((row, rowIdx) => {
        const svgWidth = SVG_PADDING + headerWidth + row.length * MEASURE_WIDTH + SVG_PADDING
        const showHeader = rowIdx === 0

        return (
          <svg
            key={rowIdx}
            width={svgWidth}
            height={SVG_HEIGHT}
            viewBox={`0 0 ${svgWidth} ${SVG_HEIGHT}`}
            style={{
              display: 'block',
              background: rowIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.008)',
              cursor: onMeasureClick ? 'pointer' : 'default',
              minWidth: svgWidth
            }}
          >
            {/* Staff lines across full width */}
            <StaffLines width={svgWidth - SVG_PADDING} />

            {/* Header (clef, key sig, time sig) — first row only */}
            {showHeader && (
              <g>
                {clef === 'treble' ? <TrebleClef /> : <BassClef />}
                {keyFifths !== 0 && (
                  <KeySignature fifths={keyFifths} clef={clef} xStart={CLEF_WIDTH + 2} />
                )}
                <TimeSignature beats={timeBeats} beatType={timeBeatType}
                  x={CLEF_WIDTH + keySigWidth + 6} />
              </g>
            )}

            {/* Measures */}
            {row.map((measure, mIdx) => {
              const xStart = SVG_PADDING + (showHeader ? headerWidth : 0) + mIdx * MEASURE_WIDTH
              const globalMeasureNum = rowIdx * measuresPerRow + mIdx + 1

              return (
                <g
                  key={measure.number}
                  onClick={() => onMeasureClick?.(globalMeasureNum)}
                  style={{ cursor: onMeasureClick ? 'pointer' : 'default' }}
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
                    showNumber
                  />
                </g>
              )
            })}
          </svg>
        )
      })}
    </div>
  )
}

// ─── Note Label Panel (shows current measure notes as text) ──────────────────

export function MeasureNoteLabels({ score, measureNumber }: {
  score: ParsedScore
  measureNumber: number
}) {
  const measure = score.measures.find(m => m.number === measureNumber)
  if (!measure) return null

  const notes = measure.notes.filter(n => !n.isRest)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
      {notes.map((n, i) => (
        <span key={i} style={{
          padding: '3px 9px', borderRadius: '999px',
          background: 'rgba(212,163,95,0.1)',
          border: '1px solid rgba(212,163,95,0.25)',
          fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)',
          fontFamily: 'monospace'
        }}>
          {getDisplayLabel(n, score.keyFifths)}
        </span>
      ))}
    </div>
  )
}
