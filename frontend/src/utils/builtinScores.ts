/**
 * Built-in score data for Beethoven's Moonlight Sonata Op.27 No.2 Mvt.I
 * (Adagio Sostenuto, C# minor, 4/4, Alla breve)
 * Right hand, first 16 measures — encoded as ParsedScore
 */
import type { ParsedScore } from './musicParser'

// In C# minor: Key signature = 4 sharps (F# C# G# D#)
// Characteristic opening: continuous triplet arpeggios in right hand
// Measure pattern: g#3 / c#4 / e4 (triplet group repeating)

export const MOONLIGHT_SONATA: ParsedScore = {
  title: 'Moonlight Sonata',
  composer: 'Ludwig van Beethoven',
  clef: 'treble',
  keyFifths: 4,      // C# minor = 4 sharps (F# C# G# D# → key signature)
  keyMode: 'minor',
  timeBeats: 4,
  timeBeatType: 4,
  divisions: 3,      // triplet feel: 3 divisions per beat = 1 triplet eighth per division
  tempoMarking: 54,
  measures: [
    // ── Measure 1 ── G#3 C#4 E4 / G#3 C#4 E4 / G#3 C#4 E4 / G#3 C#4 E4 (triplet arpeggios)
    {
      number: 1, beats: 4, beatType: 4,
      notes: [
        // Beat 1 – G#3 C#4 E4 (broken chord upward)
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        // Beat 2
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        // Beat 3
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        // Beat 4
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
      ]
    },
    // ── Measure 2 ── Same pattern (G#3 C#4 E4 repeating)
    {
      number: 2, beats: 4, beatType: 4,
      notes: [
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
      ]
    },
    // ── Measure 3 ── A3 C#4 E4 / A3 D#4 F#4 (Am7 / D#dim)
    {
      number: 3, beats: 4, beatType: 4,
      notes: [
        { step: 'A', octave: 3, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'A', octave: 3, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'A', octave: 3, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'D', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'F', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'A', octave: 3, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'D', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'F', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
      ]
    },
    // ── Measure 4 ── G#3 B3 E4 / G#3 C#4 E4 (E major / C# minor)
    {
      number: 4, beats: 4, beatType: 4,
      notes: [
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'B', octave: 3, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'B', octave: 3, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
      ]
    },
    // ── Measure 5 ── F#3 C#4 E4 (F# half-diminished)
    {
      number: 5, beats: 4, beatType: 4,
      notes: [
        { step: 'F', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'F', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'F', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'D', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'F', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'D', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
      ]
    },
    // ── Measure 6 ── F#3 A#3 C#4 / F#3 A#3 C#4 (F#7 dominant)
    {
      number: 6, beats: 4, beatType: 4,
      notes: [
        { step: 'F', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'A', octave: 3, alter: 1, accidental: 'sharp', duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'F', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'A', octave: 3, alter: 1, accidental: 'sharp', duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'F', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'A', octave: 3, alter: 1, accidental: 'sharp', duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'F', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'A', octave: 3, alter: 1, accidental: 'sharp', duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
      ]
    },
    // ── Measure 7 ── Back to G#3 C#4 E4 (C# minor tonic)
    {
      number: 7, beats: 4, beatType: 4,
      notes: [
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
      ]
    },
    // ── Measure 8 ── G#3 C#4 E4 (same, slight melody motion on top)
    {
      number: 8, beats: 4, beatType: 4,
      notes: [
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'G', octave: 3, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'C', octave: 4, alter: 1, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
        { step: 'E', octave: 4, alter: 0, accidental: null, duration: 1, type: 'eighth', dotted: false, isRest: false, isChordMember: false, tieStart: false, tieEnd: false, staff: 1 },
      ]
    },
  ]
}
