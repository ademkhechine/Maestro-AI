/**
 * Maestro AI Music Parser
 * Parses MusicXML (.xml/.mxl) and MIDI (.mid/.midi) files into a
 * structured format for display and analysis.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type NoteType = 'whole' | 'half' | 'quarter' | 'eighth' | '16th' | '32nd'
export type Clef = 'treble' | 'bass' | 'alto'
export type Accidental = 'sharp' | 'flat' | 'natural' | 'double-sharp' | 'flat-flat' | null

export interface ParsedNote {
  step: string        // C D E F G A B
  octave: number
  alter: number       // -2, -1, 0, 1, 2 (semitones: flat/sharp/natural)
  accidental: Accidental
  duration: number    // in divisions
  type: NoteType
  dotted: boolean
  isRest: boolean
  isChordMember: boolean // stacked with previous note
  tieStart: boolean
  tieEnd: boolean
  staff: number       // 1 or 2
  beam?: string
}

export interface ParsedMeasure {
  number: number
  notes: ParsedNote[]
  beats: number
  beatType: number
  tempo?: number
}

export interface ParsedScore {
  id?: string
  title: string
  composer: string
  clef: Clef
  keyFifths: number       // -7 to 7 (negative = flats, positive = sharps)
  keyMode: 'major' | 'minor'
  timeBeats: number
  timeBeatType: number
  divisions: number       // how many divisions = 1 quarter note
  measures: ParsedMeasure[]
  tempoMarking?: number   // BPM
}

// ─── Staff Position Calculation ───────────────────────────────────────────────

/**
 * Returns the note name accounting for key signature sharps/flats.
 * fifths: positive = sharps order (F C G D A E B), negative = flats order (B E A D G C F)
 */
export function getAccidentalFromKey(step: string, octave: number, fifths: number, alter: number): Accidental {
  const sharpOrder = ['F', 'C', 'G', 'D', 'A', 'E', 'B']
  const flatOrder  = ['B', 'E', 'A', 'D', 'G', 'C', 'F']

  let keyAlter = 0
  if (fifths > 0) {
    // How many sharps apply to this step
    const idx = sharpOrder.indexOf(step)
    if (idx !== -1 && idx < fifths) keyAlter = 1
  } else if (fifths < 0) {
    const idx = flatOrder.indexOf(step)
    if (idx !== -1 && idx < Math.abs(fifths)) keyAlter = -1
  }

  // If the note's alter differs from what key signature implies, mark as accidental
  if (alter !== keyAlter) {
    if (alter === 1) return 'sharp'
    if (alter === -1) return 'flat'
    if (alter === 0) return 'natural'
    if (alter === 2) return 'double-sharp'
    if (alter === -2) return 'flat-flat'
  }
  return null // key signature handles it
}

/**
 * Compute the vertical y-position of a note on the treble staff.
 * Staff coordinate: topLine (F5) = 0, each diatonic step = 7px.
 * Returns the center-y of the notehead in the SVG coordinate space.
 */
export function trebleYPosition(step: string, octave: number): number {
  // Diatonic step index (C=0, D=1, E=2, F=3, G=4, A=5, B=6)
  const stepIndex: Record<string, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }
  const idx = stepIndex[step] ?? 0

  // Reference: B4 is on the middle line (3rd line) of treble clef
  // B4 = octave 4, step B → diatonic index 6
  // We measure steps below B4 (downward = positive y in SVG)
  const refOctave = 4
  const refStep = 6 // B
  const totalSteps = (octave - refOctave) * 7 + (idx - refStep)

  // Middle line (B4) is at y = 40 in our coordinate space, step size = 7px
  return 40 - totalSteps * 7
}

/**
 * Compute the vertical y-position on the bass staff.
 * Reference: D3 is on the middle line of bass clef.
 */
export function bassYPosition(step: string, octave: number): number {
  const stepIndex: Record<string, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }
  const idx = stepIndex[step] ?? 0
  const refOctave = 3
  const refStep = 1 // D
  const totalSteps = (octave - refOctave) * 7 + (idx - refStep)
  return 40 - totalSteps * 7
}

/** Returns all ledger line y positions needed for this note (in treble clef) */
export function getLedgerLines(step: string, octave: number, clef: Clef = 'treble'): number[] {
  const y = clef === 'treble' ? trebleYPosition(step, octave) : bassYPosition(step, octave)
  const lines: number[] = []

  // Staff lines at y = 12, 19, 26, 33, 40, 47, 54, 61, 68 (with 7px spacing)
  // Actual staff lines at: 12, 19, 26, 33, 40 (treble: F5, D5, B4, G4, E4)
  // But we use: topLine=12, then +7 each

  if (y < 12) {
    // Above staff – ledger lines at 5, -2, etc.
    for (let ly = 5; ly >= y - 5; ly -= 7) lines.push(ly)
  } else if (y > 68) {
    // Below staff – ledger lines at 75, 82, etc. (middle C at 75)
    for (let ly = 75; ly <= y + 5; ly += 7) lines.push(ly)
  }
  return lines
}

// ─── Key Signature ────────────────────────────────────────────────────────────

/** Returns the display label for a note given key signature context */
export function getDisplayLabel(note: ParsedNote, keyFifths: number): string {
  const sharpOrder = ['F', 'C', 'G', 'D', 'A', 'E', 'B']
  const flatOrder  = ['B', 'E', 'A', 'D', 'G', 'C', 'F']
  let suffix = ''

  if (note.accidental === 'sharp') suffix = '#'
  else if (note.accidental === 'flat') suffix = '♭'
  else if (note.accidental === 'natural') suffix = '♮'
  else {
    // Show implied accidental from key signature
    if (keyFifths > 0 && sharpOrder.slice(0, keyFifths).includes(note.step)) suffix = '#'
    if (keyFifths < 0 && flatOrder.slice(0, Math.abs(keyFifths)).includes(note.step)) suffix = '♭'
  }

  return `${note.step}${suffix}${note.octave}`
}

// ─── MusicXML Parser ──────────────────────────────────────────────────────────

export function parseMusicXML(xmlString: string): ParsedScore {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'application/xml')

  const parseErr = doc.querySelector('parsererror')
  if (parseErr) throw new Error('Invalid XML: ' + parseErr.textContent)

  const getTag = (parent: Element | Document, tag: string): Element | null =>
    parent.querySelector(tag)
  const getText = (parent: Element | Document, tag: string): string =>
    parent.querySelector(tag)?.textContent?.trim() ?? ''
  const getNum = (parent: Element | Document, tag: string): number =>
    parseFloat(getText(parent, tag)) || 0

  // Title / Composer
  const title = doc.querySelector('movement-title')?.textContent?.trim() ??
    doc.querySelector('work-title')?.textContent?.trim() ?? 'Untitled'
  const composer = doc.querySelector('creator[type="composer"]')?.textContent?.trim() ?? ''

  // Grab the first part
  const part = doc.querySelector('part')
  if (!part) throw new Error('No <part> found in MusicXML.')

  let clef: Clef = 'treble'
  let keyFifths = 0
  let keyMode: 'major' | 'minor' = 'major'
  let timeBeats = 4
  let timeBeatType = 4
  let divisions = 4
  let tempoMarking: number | undefined

  const measures: ParsedMeasure[] = []

  for (const measureEl of Array.from(part.querySelectorAll('measure'))) {
    const measureNumber = parseInt(measureEl.getAttribute('number') ?? '1', 10)

    // Parse attributes (can be updated mid-score)
    const attrEl = measureEl.querySelector('attributes')
    if (attrEl) {
      divisions = getNum(attrEl, 'divisions') || divisions
      const fifthsEl = attrEl.querySelector('key > fifths')
      if (fifthsEl) keyFifths = parseInt(fifthsEl.textContent ?? '0', 10)
      const modeEl = attrEl.querySelector('key > mode')
      if (modeEl) keyMode = (modeEl.textContent?.trim() ?? 'major') as 'major' | 'minor'
      const beatsEl = attrEl.querySelector('time > beats')
      const beatTypeEl = attrEl.querySelector('time > beat-type')
      if (beatsEl) timeBeats = parseInt(beatsEl.textContent ?? '4', 10)
      if (beatTypeEl) timeBeatType = parseInt(beatTypeEl.textContent ?? '4', 10)
      const clefSign = attrEl.querySelector('clef > sign')?.textContent?.trim()
      if (clefSign === 'G') clef = 'treble'
      else if (clefSign === 'F') clef = 'bass'
      else if (clefSign === 'C') clef = 'alto'
    }

    // Parse tempo from direction/metronome or sound element
    const soundEl = measureEl.querySelector('sound[tempo]')
    if (soundEl) tempoMarking = parseFloat(soundEl.getAttribute('tempo') ?? '0') || tempoMarking
    const bpmEl = measureEl.querySelector('per-minute')
    if (bpmEl) tempoMarking = parseFloat(bpmEl.textContent ?? '0') || tempoMarking

    const notes: ParsedNote[] = []

    for (const noteEl of Array.from(measureEl.querySelectorAll('note'))) {
      const isRest = !!noteEl.querySelector('rest')
      const isChord = !!noteEl.querySelector('chord')
      const pitchEl = noteEl.querySelector('pitch')

      const step = pitchEl?.querySelector('step')?.textContent?.trim() ?? 'C'
      const octave = parseInt(pitchEl?.querySelector('octave')?.textContent ?? '4', 10)
      const alter = parseFloat(pitchEl?.querySelector('alter')?.textContent ?? '0') || 0

      const duration = parseInt(noteEl.querySelector('duration')?.textContent ?? '4', 10)
      const typeText = (noteEl.querySelector('type')?.textContent?.trim() ?? 'quarter') as NoteType
      const dotted = !!noteEl.querySelector('dot')

      const tieEls = Array.from(noteEl.querySelectorAll('tie'))
      const tieStart = tieEls.some(t => t.getAttribute('type') === 'start')
      const tieEnd = tieEls.some(t => t.getAttribute('type') === 'stop')

      const staffNum = parseInt(noteEl.querySelector('staff')?.textContent ?? '1', 10)

      const accidentalEl = noteEl.querySelector('accidental')
      let accidental: Accidental = null
      if (accidentalEl) {
        const accText = accidentalEl.textContent?.trim()
        if (accText === 'sharp') accidental = 'sharp'
        else if (accText === 'flat') accidental = 'flat'
        else if (accText === 'natural') accidental = 'natural'
        else if (accText === 'double-sharp') accidental = 'double-sharp'
        else if (accText === 'flat-flat') accidental = 'flat-flat'
      } else if (!isRest) {
        accidental = getAccidentalFromKey(step, octave, keyFifths, alter)
      }

      notes.push({
        step, octave, alter, accidental, duration, type: typeText,
        dotted, isRest, isChordMember: isChord,
        tieStart, tieEnd, staff: staffNum
      })
    }

    measures.push({
      number: measureNumber,
      notes,
      beats: timeBeats,
      beatType: timeBeatType,
    })
  }

  return {
    title, composer, clef, keyFifths, keyMode,
    timeBeats, timeBeatType, divisions, measures,
    tempoMarking
  }
}

// ─── MIDI Parser (Binary) ────────────────────────────────────────────────────

export interface MIDINote {
  pitch: number   // MIDI note number (0-127)
  name: string    // e.g. "C#4"
  startTick: number
  endTick: number
  velocity: number
  track: number
}

export interface ParsedMIDI {
  format: number
  ticksPerBeat: number
  notes: MIDINote[]
  tempo: number // microseconds per beat
}

const MIDI_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function midiPitchToName(pitch: number): string {
  const octave = Math.floor(pitch / 12) - 1
  const name = MIDI_NOTE_NAMES[pitch % 12]
  return `${name}${octave}`
}

function readVarLen(data: Uint8Array, offset: number): { value: number; bytesRead: number } {
  let value = 0
  let bytesRead = 0
  let byte: number
  do {
    byte = data[offset + bytesRead]
    value = (value << 7) | (byte & 0x7F)
    bytesRead++
  } while (byte & 0x80)
  return { value, bytesRead }
}

export function parseMIDI(buffer: ArrayBuffer): ParsedMIDI {
  const data = new Uint8Array(buffer)
  let offset = 0

  const readUint32 = () => {
    const v = (data[offset] << 24) | (data[offset+1] << 16) | (data[offset+2] << 8) | data[offset+3]
    offset += 4; return v >>> 0
  }
  const readUint16 = () => {
    const v = (data[offset] << 8) | data[offset+1]
    offset += 2; return v
  }

  // Header
  const headerMark = String.fromCharCode(...data.slice(0, 4))
  if (headerMark !== 'MThd') throw new Error('Not a valid MIDI file')
  offset += 4

  readUint32() // header length (always 6)
  const format = readUint16()
  const numTracks = readUint16()
  const ticksPerBeat = readUint16()

  let globalTempo = 500000 // default 120 BPM
  const allNotes: MIDINote[] = []

  for (let t = 0; t < numTracks; t++) {
    const trackMark = String.fromCharCode(...data.slice(offset, offset + 4))
    if (trackMark !== 'MTrk') { offset += 8; continue }
    offset += 4
    const trackLength = readUint32()
    const trackEnd = offset + trackLength

    let tick = 0
    let lastStatus = 0
    const activeNotes: Map<number, { startTick: number; velocity: number }> = new Map()

    while (offset < trackEnd) {
      const delta = readVarLen(data, offset)
      tick += delta.value
      offset += delta.bytesRead

      let statusByte = data[offset]
      if (statusByte & 0x80) {
        lastStatus = statusByte
        offset++
      } else {
        statusByte = lastStatus // running status
      }

      const type = (statusByte >> 4) & 0xF
      const channel = statusByte & 0xF

      if (type === 0x9) { // Note On
        const pitch = data[offset++]
        const velocity = data[offset++]
        if (velocity > 0) {
          activeNotes.set(pitch, { startTick: tick, velocity })
        } else {
          // Velocity 0 = Note Off
          const active = activeNotes.get(pitch)
          if (active) {
            allNotes.push({
              pitch, name: midiPitchToName(pitch),
              startTick: active.startTick, endTick: tick,
              velocity: active.velocity, track: t
            })
            activeNotes.delete(pitch)
          }
        }
      } else if (type === 0x8) { // Note Off
        const pitch = data[offset++]
        offset++ // velocity ignored for note off
        const active = activeNotes.get(pitch)
        if (active) {
          allNotes.push({
            pitch, name: midiPitchToName(pitch),
            startTick: active.startTick, endTick: tick,
            velocity: active.velocity, track: t
          })
          activeNotes.delete(pitch)
        }
      } else if (type === 0xA) { offset += 2 } // Aftertouch
      else if (type === 0xB) { offset += 2 } // Control Change
      else if (type === 0xC) { offset += 1 } // Program Change
      else if (type === 0xD) { offset += 1 } // Channel Pressure
      else if (type === 0xE) { offset += 2 } // Pitch Bend
      else if (statusByte === 0xFF) { // Meta event
        const metaType = data[offset++]
        const metaLen = readVarLen(data, offset)
        offset += metaLen.bytesRead
        if (metaType === 0x51 && metaLen.value === 3) {
          // Tempo
          globalTempo = (data[offset] << 16) | (data[offset+1] << 8) | data[offset+2]
        }
        offset += metaLen.value
      } else if (statusByte === 0xF0 || statusByte === 0xF7) { // SysEx
        const sysLen = readVarLen(data, offset)
        offset += sysLen.bytesRead + sysLen.value
      } else {
        offset++ // Unknown, skip
      }
    }
    offset = trackEnd
  }

  // Sort by start tick
  allNotes.sort((a, b) => a.startTick - b.startTick)

  return { format, ticksPerBeat, notes: allNotes, tempo: globalTempo }
}

/**
 * Converts a ParsedMIDI into a ParsedScore so it can be rendered
 * on the same staff renderer as MusicXML.
 */
export function midiToScore(midi: ParsedMIDI, title = 'Uploaded MIDI'): ParsedScore {
  const stepIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const ticksPerMeasure = midi.ticksPerBeat * 4 // assumes 4/4

  const measures: ParsedMeasure[] = []
  let measureNum = 1

  for (let startTick = 0; ; startTick += ticksPerMeasure) {
    const measureNotes = midi.notes.filter(n =>
      n.startTick >= startTick && n.startTick < startTick + ticksPerMeasure
    )
    if (measureNotes.length === 0 && startTick > 0) break

    const parsed: ParsedNote[] = measureNotes.map(n => {
      const semitone = n.pitch % 12
      const octave = Math.floor(n.pitch / 12) - 1
      const isSharp = ['C#', 'D#', 'F#', 'G#', 'A#'].includes(stepIndex[semitone])
      const step = isSharp ? stepIndex[semitone][0] : stepIndex[semitone]
      const alter = isSharp ? 1 : 0

      const durTicks = n.endTick - n.startTick
      const qn = durTicks / midi.ticksPerBeat
      let type: NoteType = 'quarter'
      if (qn >= 4) type = 'whole'
      else if (qn >= 2) type = 'half'
      else if (qn >= 0.5) type = 'quarter'
      else if (qn >= 0.25) type = 'eighth'
      else type = '16th'

      return {
        step, octave, alter,
        accidental: isSharp ? 'sharp' : null,
        duration: durTicks, type,
        dotted: false, isRest: false, isChordMember: false,
        tieStart: false, tieEnd: false, staff: 1
      }
    })

    measures.push({ number: measureNum++, notes: parsed, beats: 4, beatType: 4 })
    if (measureNum > 100) break
  }

  const bpm = Math.round(60_000_000 / midi.tempo)

  return {
    title, composer: '',
    clef: 'treble', keyFifths: 0, keyMode: 'major',
    timeBeats: 4, timeBeatType: 4,
    divisions: midi.ticksPerBeat,
    measures, tempoMarking: bpm
  }
}
