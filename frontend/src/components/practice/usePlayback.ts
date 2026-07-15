/**
 * usePlayback — Synchronized audio playback engine for Maestro AI
 * Uses Tone.js for accurate scheduling. Tracks cursor, syncs to BPM,
 * supports loop, count-in, metronome, slow-practice, and per-note callbacks.
 */
import { useRef, useCallback, useState, useEffect } from 'react'
import * as Tone from 'tone'
import type { ParsedScore } from '../../utils/musicParser'

export interface PlaybackNote {
  time: number      // seconds from start
  step: string
  octave: number
  alter: number
  duration: number  // seconds
  measureIndex: number
  noteIndex: number
  isRest: boolean
}

// Map note step + alter to Tone.js pitch string
function toTonePitch(step: string, octave: number, alter: number): string {
  const altChar = alter === 1 ? '#' : alter === -1 ? 'b' : alter === 2 ? '##' : alter === -2 ? 'bb' : ''
  return `${step}${altChar}${octave}`
}

// Convert note type string to Tone.js duration string
function typeToDuration(type: string, dotted: boolean, bpm: number, divisions: number): number {
  const quarterDuration = 60 / bpm
  let beats = 1
  switch (type) {
    case 'whole':    beats = 4; break
    case 'half':     beats = 2; break
    case 'quarter':  beats = 1; break
    case 'eighth':   beats = 0.5; break
    case '16th':     beats = 0.25; break
    case '32nd':     beats = 0.125; break
    default:         beats = 1
  }
  if (dotted) beats *= 1.5
  return beats * quarterDuration
}

export type PlaybackStatus = 'stopped' | 'playing' | 'paused'

interface UsePlaybackOptions {
  score: ParsedScore
  bpm: number
  isLooping: boolean
  loopStart: number
  loopEnd: number
  countIn: number             // number of count-in beats (0 = no count-in)
  slowFactor: number          // 1.0 = normal, 0.5 = half speed
  onNotePlay?: (measureIdx: number, noteIdx: number) => void
  onMeasureChange?: (measureNum: number) => void
  onPlaybackEnd?: () => void
}

export function usePlayback({
  score, bpm, isLooping, loopStart, loopEnd, countIn, slowFactor,
  onNotePlay, onMeasureChange, onPlaybackEnd
}: UsePlaybackOptions) {
  const [status, setStatus] = useState<PlaybackStatus>('stopped')
  const [positionSeconds, setPositionSeconds] = useState(0)
  const [activeMeasure, setActiveMeasure] = useState(1)
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null)

  const synthRef = useRef<Tone.PolySynth | null>(null)
  const metronomeRef = useRef<Tone.MembraneSynth | null>(null)
  const partRef = useRef<Tone.Part | null>(null)
  const tickerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const scheduledNotesRef = useRef<PlaybackNote[]>([])
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      stopPlayback()
    }
  }, [])

  // Build a flat list of events with absolute time positions
  const buildSchedule = useCallback((fromMeasure: number, toMeasure: number): PlaybackNote[] => {
    const effectiveBpm = bpm * slowFactor
    const events: PlaybackNote[] = []
    let absoluteTime = 0

    const measures = score.measures.filter(m => m.number >= fromMeasure && m.number <= toMeasure)

    for (const measure of measures) {
      let measureOffset = absoluteTime
      let noteOffset = 0

      for (let ni = 0; ni < measure.notes.length; ni++) {
        const note = measure.notes[ni]
        const dur = typeToDuration(note.type, note.dotted, effectiveBpm, score.divisions)
        const time = measureOffset + noteOffset

        events.push({
          time,
          step: note.step,
          octave: note.octave,
          alter: note.alter,
          duration: dur * 0.9,
          measureIndex: measure.number,
          noteIndex: ni,
          isRest: note.isRest
        })

        if (!note.isChordMember) noteOffset += dur
      }

      // Advance absoluteTime by measure duration based on beats
      const measureDur = (measure.beats / measure.beatType) * 4 * (60 / effectiveBpm)
      absoluteTime += measureDur
    }

    return events
  }, [score, bpm, slowFactor])

  const stopTicker = useCallback(() => {
    if (tickerRef.current !== null) {
      cancelAnimationFrame(tickerRef.current)
      tickerRef.current = null
    }
  }, [])

  const startTicker = useCallback(() => {
    const tick = () => {
      if (!isMountedRef.current) return
      const elapsed = Tone.getContext().currentTime - startTimeRef.current
      setPositionSeconds(elapsed)

      // Find the current note based on elapsed time
      const notes = scheduledNotesRef.current
      for (let i = notes.length - 1; i >= 0; i--) {
        if (notes[i].time <= elapsed) {
          if (isMountedRef.current) {
            setActiveMeasure(notes[i].measureIndex)
            setActiveNoteIndex(notes[i].noteIndex)
          }
          break
        }
      }

      tickerRef.current = requestAnimationFrame(tick)
    }
    tickerRef.current = requestAnimationFrame(tick)
  }, [])

  const stopPlayback = useCallback(async () => {
    stopTicker()
    if (partRef.current) { partRef.current.stop(); partRef.current.dispose(); partRef.current = null }
    if (synthRef.current) { synthRef.current.releaseAll(); synthRef.current.dispose(); synthRef.current = null }
    if (metronomeRef.current) { metronomeRef.current.dispose(); metronomeRef.current = null }
    await Tone.getTransport().stop()
    Tone.getTransport().cancel()
    setStatus('stopped')
    setActiveNoteIndex(null)
    setPositionSeconds(0)
  }, [stopTicker])

  const startPlayback = useCallback(async (fromMeasure = 1) => {
    await stopPlayback()
    await Tone.start()

    const toMeasure = isLooping ? loopEnd : score.measures.length
    const from = isLooping ? loopStart : fromMeasure

    const notes = buildSchedule(from, toMeasure)
    scheduledNotesRef.current = notes

    if (notes.length === 0) return

    // Initialize synth
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.6, release: 0.4 },
      volume: -6
    }).toDestination()
    synthRef.current = synth

    // Metronome
    const metro = new Tone.MembraneSynth({ volume: -18 }).toDestination()
    metronomeRef.current = metro

    Tone.getTransport().bpm.value = bpm * slowFactor
    const totalDuration = notes[notes.length - 1].time + notes[notes.length - 1].duration

    const part = new Tone.Part((time, event: PlaybackNote) => {
      if (!event.isRest) {
        const pitch = toTonePitch(event.step, event.octave, event.alter)
        try {
          synth.triggerAttackRelease(pitch, event.duration, time)
        } catch {
          // Ignore unrecognized pitches
        }
      }
      if (isMountedRef.current) {
        onNotePlay?.(event.measureIndex, event.noteIndex)
        onMeasureChange?.(event.measureIndex)
      }
    }, notes.map(n => [n.time, n]))

    part.start(0)
    partRef.current = part

    // Count-in scheduling before start
    const countInDuration = countIn > 0 ? (countIn * 60) / (bpm * slowFactor) : 0

    Tone.getTransport().scheduleOnce(() => {
      if (isMountedRef.current) {
        startTimeRef.current = Tone.getContext().currentTime
        startTicker()
        setStatus('playing')
      }
    }, countInDuration)

    Tone.getTransport().scheduleOnce(async () => {
      if (!isMountedRef.current) return
      if (isLooping) {
        await stopPlayback()
        startPlayback(from)
      } else {
        await stopPlayback()
        onPlaybackEnd?.()
      }
    }, totalDuration + countInDuration + 0.5)

    await Tone.getTransport().start()
  }, [bpm, slowFactor, score, isLooping, loopStart, loopEnd, countIn, buildSchedule, startTicker, stopPlayback, onNotePlay, onMeasureChange, onPlaybackEnd])

  const pausePlayback = useCallback(async () => {
    stopTicker()
    Tone.getTransport().pause()
    setStatus('paused')
  }, [stopTicker])

  const resumePlayback = useCallback(async () => {
    await Tone.getTransport().start()
    startTicker()
    setStatus('playing')
  }, [startTicker])

  return {
    status,
    positionSeconds,
    activeMeasure,
    activeNoteIndex,
    startPlayback,
    stopPlayback,
    pausePlayback,
    resumePlayback,
  }
}
