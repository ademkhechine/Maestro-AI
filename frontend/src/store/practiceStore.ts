import { create } from 'zustand'

export type PracticePhase = 'idle' | 'countdown' | 'recording' | 'analyzing' | 'results'

export interface SessionAnalysis {
  pitch_accuracy: number
  rhythm_accuracy: number
  tempo_stability: number
  expression_score: number
  overall_score: number
  missed_notes: number
  wrong_notes: number
  problem_measures: number[]
  heatmap_data: Record<string, 'green' | 'yellow' | 'red'>
}

export interface AIFeedback {
  feedback: string
  recommendations: string[]
  practice_plan: Array<{ day: number; focus: string; duration_minutes: number; exercises: string[] }>
  encouragement: string
}

interface PracticeState {
  phase: PracticePhase
  sessionId: string | null
  elapsedSeconds: number
  bpm: number
  isMetronomeOn: boolean
  isLooping: boolean
  loopStart: number
  loopEnd: number
  currentMeasure: number
  analysis: SessionAnalysis | null
  aiFeedback: AIFeedback | null
  isRecording: boolean

  setPhase: (phase: PracticePhase) => void
  setSessionId: (id: string) => void
  setBpm: (bpm: number) => void
  toggleMetronome: () => void
  toggleLoop: () => void
  setLoopRange: (start: number, end: number) => void
  setCurrentMeasure: (m: number) => void
  setElapsed: (s: number) => void
  setAnalysis: (a: SessionAnalysis) => void
  setAIFeedback: (f: AIFeedback) => void
  setRecording: (v: boolean) => void
  reset: () => void
}

export const usePracticeStore = create<PracticeState>((set) => ({
  phase: 'idle',
  sessionId: null,
  elapsedSeconds: 0,
  bpm: 120,
  isMetronomeOn: false,
  isLooping: false,
  loopStart: 1,
  loopEnd: 8,
  currentMeasure: 1,
  analysis: null,
  aiFeedback: null,
  isRecording: false,

  setPhase: (phase) => set({ phase }),
  setSessionId: (id) => set({ sessionId: id }),
  setBpm: (bpm) => set({ bpm }),
  toggleMetronome: () => set((s) => ({ isMetronomeOn: !s.isMetronomeOn })),
  toggleLoop: () => set((s) => ({ isLooping: !s.isLooping })),
  setLoopRange: (start, end) => set({ loopStart: start, loopEnd: end }),
  setCurrentMeasure: (m) => set({ currentMeasure: m }),
  setElapsed: (s) => set({ elapsedSeconds: s }),
  setAnalysis: (a) => set({ analysis: a }),
  setAIFeedback: (f) => set({ aiFeedback: f }),
  setRecording: (v) => set({ isRecording: v }),
  reset: () => set({
    phase: 'idle', sessionId: null, elapsedSeconds: 0,
    analysis: null, aiFeedback: null, isRecording: false, currentMeasure: 1,
  }),
}))
