import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Volume2, Award, BookOpen, Compass, CheckCircle2,
  AlertCircle, ExternalLink, Globe, Music2, VolumeX
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

import PianoKeyboard from '../components/maqam/PianoKeyboard'
import OudFingerboard from '../components/maqam/OudFingerboard'
import ViolinFingerboard from '../components/maqam/ViolinFingerboard'
import QanunLayout from '../components/maqam/QanunLayout'

// ─── Data Definitions ────────────────────────────────────────────────────────

interface Note {
  name: string
  midi: number
  cents?: number
}

interface JinsData {
  name: string
  arabicName: string
  notesCount: number
  description: string
  notesText: string
  tonic: string
  ghammad: string
  intervals: string
  baseMidi: number
  notes: Note[]
}

const ajnasList: JinsData[] = [
  {
    name: "Jins Sikah",
    arabicName: "جنس سيكاه",
    notesCount: 3,
    description: "The primary microtonal building block of Arabic music, built on a half-flat note (Sikah). It has a warm, mystical, and deeply expressive mood.",
    notesText: "E½♭ - F - G",
    tonic: "E½♭",
    ghammad: "G",
    intervals: "3/4 - 1 - (variable)",
    baseMidi: 64, // E4
    notes: [
      { name: "E½♭4", midi: 64, cents: -50 },
      { name: "F4", midi: 65 },
      { name: "G4", midi: 67 },
    ]
  },
  {
    name: "Jins Mousta'ar",
    arabicName: "جنس مستعار",
    notesCount: 3,
    description: "A rare and highly expressive microtonal jins. It is typically embedded inside other maqamat (like Sikah) to add color.",
    notesText: "F# - G - A",
    tonic: "F#",
    ghammad: "A",
    intervals: "1/2 - 1 1/2",
    baseMidi: 66, // F#4
    notes: [
      { name: "F#4", midi: 66 },
      { name: "G4", midi: 67 },
      { name: "A4", midi: 69 },
    ]
  },
  {
    name: "Jins Rast",
    arabicName: "جنس راست",
    notesCount: 4,
    description: "The pillar of Eastern/Arabic music theory. It sounds proud, bright, and stable, utilizing the characteristic quarter-tone (E half-flat).",
    notesText: "C - D - E½♭ - F",
    tonic: "C",
    ghammad: "F",
    intervals: "1 - 3/4 - 3/4",
    baseMidi: 60, // C4
    notes: [
      { name: "C4", midi: 60 },
      { name: "D4", midi: 62 },
      { name: "E½♭4", midi: 64, cents: -50 },
      { name: "F4", midi: 65 },
    ]
  },
  {
    name: "Jins Bayati",
    arabicName: "جنس بياتي",
    notesCount: 4,
    description: "Extremely popular in Arabic folk and classical music. It starts with a microtonal interval, creating a melancholic yet comforting mood.",
    notesText: "D - E½♭ - F - G",
    tonic: "D",
    ghammad: "G",
    intervals: "3/4 - 3/4 - 1",
    baseMidi: 62, // D4
    notes: [
      { name: "D4", midi: 62 },
      { name: "E½♭4", midi: 64, cents: -50 },
      { name: "F4", midi: 65 },
      { name: "G4", midi: 67 },
    ]
  },
  {
    name: "Jins Hijaz",
    arabicName: "جنس حجاز",
    notesCount: 4,
    description: "Famous for its distinctive augmented second interval. It sounds exotic, dramatic, and carries a strong emotional pull.",
    notesText: "D - E♭ - F# - G",
    tonic: "D",
    ghammad: "G",
    intervals: "1/2 - 1 1/2 - 1/2",
    baseMidi: 62, // D4
    notes: [
      { name: "D4", midi: 62 },
      { name: "E♭4", midi: 63 },
      { name: "F#4", midi: 66 },
      { name: "G4", midi: 67 },
    ]
  },
  {
    name: "Jins Nahawand",
    arabicName: "جنس نهاوند",
    notesCount: 4,
    description: "Equivalent to the Western natural minor scale fragment. It has a romantic, dramatic, and melancholic character.",
    notesText: "D - E - F - G",
    tonic: "D",
    ghammad: "G",
    intervals: "1 - 1/2 - 1",
    baseMidi: 62, // D4
    notes: [
      { name: "D4", midi: 62 },
      { name: "E4", midi: 64 },
      { name: "F4", midi: 65 },
      { name: "G4", midi: 67 },
    ]
  },
  {
    name: "Jins Kurd",
    arabicName: "جنس كرد",
    notesCount: 4,
    description: "Built on a minor second interval. It sounds modern, intense, and is widely used across all music styles.",
    notesText: "D - E♭ - F - G",
    tonic: "D",
    ghammad: "G",
    intervals: "1/2 - 1 - 1",
    baseMidi: 62, // D4
    notes: [
      { name: "D4", midi: 62 },
      { name: "E♭4", midi: 63 },
      { name: "F4", midi: 65 },
      { name: "G4", midi: 67 },
    ]
  },
  {
    name: "Jins Saba",
    arabicName: "جنس صبا",
    notesCount: 4,
    description: "Highly unique and emotional Jins. It features a diminished fourth scale degree, sounding sad, pleading, and intensely nostalgic.",
    notesText: "D - E½♭ - F - G♭",
    tonic: "D",
    ghammad: "F",
    intervals: "3/4 - 3/4 - 1/2",
    baseMidi: 62, // D4
    notes: [
      { name: "D4", midi: 62 },
      { name: "E½♭4", midi: 64, cents: -50 },
      { name: "F4", midi: 65 },
      { name: "G♭4", midi: 66 },
    ]
  }
]

interface MaqamData {
  name: string
  arabicName: string
  rootJins: string
  upperJins: string
  ghammadNode: string
  description: string
  notesText: string
  emotionalCharacter: string
  historicalOrigins: string
  famousSongs: string[]
  notes: Note[]
}

const maqamatList: MaqamData[] = [
  {
    name: "Maqam Rast",
    arabicName: "مقام راست",
    rootJins: "Jins Rast on C (Tonic)",
    upperJins: "Jins Rast on G (Ghammad)",
    ghammadNode: "G (5th degree)",
    description: "The fundamental Maqam of Arabic classical music. It is highly structured, elegant, and balances the microtonality of E half-flat and B half-flat.",
    notesText: "C - D - E½♭ - F - G - A - B½♭ - C",
    emotionalCharacter: "Pride, strength, mental clarity, and joy.",
    historicalOrigins: "Dating back to medieval Persia and Arabia, standardizing Eastern music.",
    famousSongs: ["Ghandara (Umm Kulthum)", "Ya Shadi al-Alhan (Traditional Muwashshah)"],
    notes: [
      { name: "C4", midi: 60 },
      { name: "D4", midi: 62 },
      { name: "E½♭4", midi: 64, cents: -50 },
      { name: "F4", midi: 65 },
      { name: "G4", midi: 67 },
      { name: "A4", midi: 69 },
      { name: "B½♭4", midi: 71, cents: -50 },
      { name: "C5", midi: 72 }
    ]
  },
  {
    name: "Maqam Bayati",
    arabicName: "مقام بياتي",
    rootJins: "Jins Bayati on D (Tonic)",
    upperJins: "Jins Nahawand on G (Ghammad)",
    ghammadNode: "G (4th degree)",
    description: "Warm, emotional, and deeply traditional. It is the primary scale used for spiritual chanting, love songs, and pastoral improvisation.",
    notesText: "D - E½♭ - F - G - A - B♭ - C - D",
    emotionalCharacter: "Melancholy, comfort, warm hospitality, and deep devotion.",
    historicalOrigins: "Rooted deeply in desert folk traditions and Levant regional music.",
    famousSongs: ["Ala Balad al-Mahboub (Umm Kulthum)", "Zahrat al-Mada'in (Fairuz)"],
    notes: [
      { name: "D4", midi: 62 },
      { name: "E½♭4", midi: 64, cents: -50 },
      { name: "F4", midi: 65 },
      { name: "G4", midi: 67 },
      { name: "A4", midi: 69 },
      { name: "B♭4", midi: 70 },
      { name: "C5", midi: 72 },
      { name: "D5", midi: 74 }
    ]
  },
  {
    name: "Maqam Hijaz",
    arabicName: "مقام حجاز",
    rootJins: "Jins Hijaz on D (Tonic)",
    upperJins: "Jins Bayati on G (Ghammad)",
    ghammadNode: "G (4th degree)",
    description: "Mysterious, expressive, and deeply passionate. The augmented second (Eb to F#) gives this Maqam its unmistakable, soaring Eastern flavor.",
    notesText: "D - E♭ - F# - G - A - B½♭ - C - D",
    emotionalCharacter: "Drama, intensity, spiritual longing, and exotic passion.",
    historicalOrigins: "Originated in the Hejaz region of the Arabian Peninsula.",
    famousSongs: ["Lamma Bada Yatathanna (Traditional Muwashshah)", "Al-Atlal (Umm Kulthum)"],
    notes: [
      { name: "D4", midi: 62 },
      { name: "E♭4", midi: 63 },
      { name: "F#4", midi: 66 },
      { name: "G4", midi: 67 },
      { name: "A4", midi: 69 },
      { name: "B½♭4", midi: 71, cents: -50 },
      { name: "C5", midi: 72 },
      { name: "D5", midi: 74 }
    ]
  },
  {
    name: "Maqam Saba",
    arabicName: "مقام صبا",
    rootJins: "Jins Saba on D (Tonic)",
    upperJins: "Jins Hijaz on F (Ghammad)",
    ghammadNode: "F (3rd degree)",
    description: "The most melancholic and sorrowful Maqam. It does not complete an octave naturally and features an incredibly intense, pleading mood.",
    notesText: "D - E½♭ - F - G♭ - A - B♭ - C - D♭",
    emotionalCharacter: "Profound grief, pleading, yearning, and nostalgia.",
    historicalOrigins: "Dating back to classical Arabic liturgical recitals and lamentations.",
    famousSongs: ["Huwwa Sahih el-Hawa Yighlib (Umm Kulthum)", "Saba Improvisations (Munir Bashir)"],
    notes: [
      { name: "D4", midi: 62 },
      { name: "E½♭4", midi: 64, cents: -50 },
      { name: "F4", midi: 65 },
      { name: "G♭4", midi: 66 },
      { name: "A4", midi: 69 },
      { name: "B♭4", midi: 70 },
      { name: "C5", midi: 72 },
      { name: "D♭5", midi: 73 }
    ]
  }
]

// ─── Playback Helper ────────────────────────────────────────────────────────

const playSoundSequence = (notes: { midi: number; cents?: number; duration: number }[]) => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioContextClass) return
  const ctx = new AudioContextClass()
  let time = ctx.currentTime

  notes.forEach(note => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    const centsOffset = note.cents || 0
    const freq = 440 * Math.pow(2, (note.midi - 69 + centsOffset / 100) / 12)

    osc.frequency.value = freq
    osc.type = 'triangle' // warmer drone-like tone

    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(0.2, time + 0.04)
    gain.gain.linearRampToValueAtTime(0.2, time + note.duration - 0.04)
    gain.gain.exponentialRampToValueAtTime(0.001, time + note.duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(time)
    osc.stop(time + note.duration)

    time += note.duration + 0.05
  })
}

export default function MaqamPage() {
  const [activeTab, setActiveTab] = useState<'maqam' | 'jins' | 'quiz' | 'reference'>('maqam')
  const [selectedJins, setSelectedJins] = useState<JinsData>(ajnasList[2]) // default Rast
  const [selectedMaqam, setSelectedMaqam] = useState<MaqamData>(maqamatList[0]) // default Rast
  
  // Synchronized Selection Note Index (0-7 for the 8 degrees of the selected Maqam)
  const [selectedNoteIndex, setSelectedNoteIndex] = useState<number>(0)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDroneOn, setIsDroneOn] = useState(false)
  const droneOscRef = useRef<OscillatorNode | null>(null)
  const droneCtxRef = useRef<AudioContext | null>(null)

  // Quiz State
  const [quizJins, setQuizJins] = useState<JinsData | null>(null)
  const [quizOptions, setQuizOptions] = useState<JinsData[]>([])
  const [quizStatus, setQuizStatus] = useState<'idle' | 'playing' | 'answered'>('idle')
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)

  const { updateUser, user } = useAuthStore()

  // Clean up drone on unmount
  useEffect(() => {
    return () => {
      if (droneOscRef.current) {
        try { droneOscRef.current.stop(); } catch(e){}
      }
    }
  }, [])

  const handlePlayJins = (jins: JinsData) => {
    if (isPlaying) return
    setIsPlaying(true)
    const notesToPlay = jins.notes.map(n => ({
      midi: n.midi,
      cents: n.cents,
      duration: 0.5
    }))
    playSoundSequence(notesToPlay)
    setTimeout(() => setIsPlaying(false), notesToPlay.length * 550)
  }

  const handlePlayMaqam = (maqam: MaqamData) => {
    if (isPlaying) return
    setIsPlaying(true)
    const notesToPlay = maqam.notes.map(n => ({
      midi: n.midi,
      cents: n.cents,
      duration: 0.45
    }))
    playSoundSequence(notesToPlay)
    setTimeout(() => setIsPlaying(false), notesToPlay.length * 500)
  }

  const toggleDrone = (tonicMidi: number) => {
    if (isDroneOn) {
      if (droneOscRef.current) {
        try { droneOscRef.current.stop(); } catch(e){}
        droneOscRef.current = null
      }
      setIsDroneOn(false)
    } else {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      const ctx = new AudioContextClass()
      droneCtxRef.current = ctx
      
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      // Drone playing 1 octave lower than scale tonic
      const freq = 440 * Math.pow(2, (tonicMidi - 12 - 69) / 12)
      osc.frequency.value = freq
      osc.type = 'sine'
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      
      droneOscRef.current = osc
      setIsDroneOn(true)
    }
  }

  // Play single microtonal scale degree
  const playScaleDegree = (note: Note, idx: number) => {
    setSelectedNoteIndex(idx)
    playSoundSequence([{
      midi: note.midi,
      cents: note.cents,
      duration: 0.6
    }])
  }

  // Quiz Logic
  const startQuizQuestion = () => {
    const correct = ajnasList[Math.floor(Math.random() * ajnasList.length)]
    setQuizJins(correct)

    const optionsSet = new Set<JinsData>([correct])
    while (optionsSet.size < 4) {
      optionsSet.add(ajnasList[Math.floor(Math.random() * ajnasList.length)])
    }
    const optionsArray = Array.from(optionsSet)
    optionsArray.sort(() => Math.random() - 0.5)

    setQuizOptions(optionsArray)
    setSelectedAnswer(null)
    setQuizStatus('playing')

    const notesToPlay = correct.notes.map(n => ({
      midi: n.midi,
      cents: n.cents,
      duration: 0.6
    }))
    playSoundSequence(notesToPlay)
  }

  const replayQuizJins = () => {
    if (!quizJins) return
    const notesToPlay = quizJins.notes.map(n => ({
      midi: n.midi,
      cents: n.cents,
      duration: 0.6
    }))
    playSoundSequence(notesToPlay)
  }

  const handleAnswerSubmit = (optionName: string) => {
    if (quizStatus !== 'playing') return
    setSelectedAnswer(optionName)
    setQuizStatus('answered')

    const isCorrect = optionName === quizJins?.name
    if (isCorrect) {
      setScore(s => s + 1)
      setStreak(s => s + 1)
      if (user) {
        updateUser({
          total_xp: user.total_xp + 25,
        })
      }
    } else {
      setStreak(0)
    }
  }

  return (
    <div className="page-stack">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="heading-lg" style={{ color: 'var(--text-primary)' }}>Arabic Maqam System</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Explore microtonal scales, interactive fingerboards (Oud, Violin, Qanun), and microtonal playbacks.
        </p>
      </motion.div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', paddingBottom: '4px', flexWrap: 'wrap' }}>
        {[
          { id: 'maqam',     label: 'Maqam Encyclopedia', icon: Compass },
          { id: 'jins',      label: 'Jins (Ajnas) Directory', icon: BookOpen },
          { id: 'quiz',      label: 'Ear Training Hub',   icon: Award },
          { id: 'reference', label: 'Maqam World Ref.',  icon: Globe },
        ].map(t => {
          const Icon = t.icon
          const active = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id as any); setQuizStatus('idle') }}
              className="btn-ghost"
              style={{
                background: active ? 'rgba(212,163,95,0.1)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500,
                borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                borderRadius: '8px 8px 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                fontSize: '0.85rem',
              }}
            >
              <Icon size={14} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      <div className="card" style={{ padding: '24px' }}>
        <AnimatePresence mode="wait">
          
          {/* TAB 1: MAQAM BROWSER WITH SYNCHRONIZED VISUALIZATIONS */}
          {activeTab === 'maqam' && (
            <motion.div
              key="maqam-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              {/* Top Row Selector & Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
                
                {/* Left Side: Select Maqam list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h3 className="heading-md mb-2" style={{ color: 'var(--text-primary)' }}>Arabic Maqamat</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {maqamatList.map(m => (
                        <button
                          key={m.name}
                          onClick={() => { setSelectedMaqam(m); setSelectedNoteIndex(0) }}
                          className="btn-ghost"
                          style={{
                            background: selectedMaqam.name === m.name ? 'rgba(212,163,95,0.16)' : 'var(--bg-surface)',
                            border: selectedMaqam.name === m.name ? '1px solid var(--primary)' : '1px solid var(--border)',
                            color: selectedMaqam.name === m.name ? 'var(--primary)' : 'var(--text-secondary)',
                            fontSize: '0.85rem',
                            padding: '8px 16px'
                          }}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="divider" />

                  {/* Play Scale Degrees & Audio controllers */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handlePlayMaqam(selectedMaqam)}
                        disabled={isPlaying}
                        className="btn-primary"
                        style={{ flex: 1, padding: '10px', justifyContent: 'center' }}
                      >
                        <Volume2 size={16} /> {isPlaying ? 'Playing Scale...' : 'Play Ascending'}
                      </button>
                      <button
                        onClick={() => toggleDrone(selectedMaqam.notes[0].midi)}
                        className={isDroneOn ? "btn-danger" : "btn-secondary"}
                        style={{ flex: 1, padding: '10px', justifyContent: 'center' }}
                      >
                        {isDroneOn ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        {isDroneOn ? 'Stop Tonic Drone' : 'Start Tonic Drone'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side: Maqam details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2 className="heading-lg" style={{ color: 'var(--text-primary)' }}>{selectedMaqam.name}</h2>
                      <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{selectedMaqam.arabicName}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.82rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                    {selectedMaqam.description}
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', background: 'var(--bg-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Tonic (Root Jins)</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedMaqam.rootJins}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Ghammad (Dominant)</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedMaqam.ghammadNode}</span>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Emotional Mood / Character</span>
                      <span style={{ fontWeight: 700, color: 'var(--warning)' }}>{selectedMaqam.emotionalCharacter}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Row: Scale Degrees Selector (Crucial core logic) */}
              <div className="card-elevated" style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Select Scale Degree to update every instrument layout simultaneously:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px' }}>
                  {selectedMaqam.notes.map((note, index) => {
                    const isSelected = index === selectedNoteIndex
                    const isMicrotonal = note.cents && note.cents !== 0
                    return (
                      <button
                        key={index}
                        onClick={() => playScaleDegree(note, index)}
                        className="btn-ghost"
                        style={{
                          background: isSelected ? 'var(--primary)' : 'var(--bg-surface)',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                          color: isSelected ? '#0F0805' : 'var(--text-primary)',
                          display: 'flex', flexDirection: 'column', gap: '4px',
                          padding: '10px 4px', alignItems: 'center', cursor: 'pointer'
                        }}
                      >
                        <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>Degree {index + 1}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>{note.name}</span>
                        {isMicrotonal && (
                          <span className="badge badge-gold" style={{ fontSize: '0.55rem', padding: '0px 3px' }}>-50¢</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Visualizations Grid (Synchronized) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* 1. Piano Keyboard */}
                <div className="card" style={{ padding: '16px' }}>
                  <PianoKeyboard
                    scale={selectedMaqam.notes}
                    selectedNoteIndex={selectedNoteIndex}
                    onNoteSelect={setSelectedNoteIndex}
                  />
                </div>

                {/* 2. Oud Fingerboard */}
                <div className="card" style={{ padding: '16px' }}>
                  <OudFingerboard
                    scale={selectedMaqam.notes}
                    selectedNoteIndex={selectedNoteIndex}
                    onNoteSelect={setSelectedNoteIndex}
                  />
                </div>

                {/* 3. Violin Fingerboard */}
                <div className="card" style={{ padding: '16px' }}>
                  <ViolinFingerboard
                    scale={selectedMaqam.notes}
                    selectedNoteIndex={selectedNoteIndex}
                    onNoteSelect={setSelectedNoteIndex}
                  />
                </div>

                {/* 4. Qanun Course Layout */}
                <div className="card" style={{ padding: '16px' }}>
                  <QanunLayout
                    scale={selectedMaqam.notes}
                    selectedNoteIndex={selectedNoteIndex}
                    onNoteSelect={setSelectedNoteIndex}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: AJNAS DIRECTORY */}
          {activeTab === 'jins' && (
            <motion.div
              key="jins-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="two-col"
            >
              {/* Left Column: Jins List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 className="heading-md mb-2" style={{ color: 'var(--text-primary)' }}>Select a Jins (Scale Fragment)</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {ajnasList.map(j => (
                      <button
                        key={j.name}
                        onClick={() => setSelectedJins(j)}
                        className="btn-ghost"
                        style={{
                          background: selectedJins.name === j.name ? 'rgba(212,163,95,0.16)' : 'var(--bg-surface)',
                          border: selectedJins.name === j.name ? '1px solid var(--primary)' : '1px solid var(--border)',
                          color: selectedJins.name === j.name ? 'var(--primary)' : 'var(--text-secondary)',
                          fontSize: '0.85rem',
                          padding: '6px 12px'
                        }}
                      >
                        {j.name} <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>({j.notesCount}n)</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card-elevated" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Interactive Scale Degrees</span>
                    <button
                      onClick={() => handlePlayJins(selectedJins)}
                      disabled={isPlaying}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      <Volume2 size={13} /> {isPlaying ? 'Playing...' : 'Play Scale'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', background: '#0F0805', padding: '16px', borderRadius: '10px' }}>
                    {selectedJins.notes.map((note, index) => {
                      const isMicrotonal = note.cents && note.cents !== 0
                      return (
                        <div
                          key={index}
                          style={{
                            width: '56px',
                            height: '110px',
                            background: index === 0 ? 'linear-gradient(to bottom, #D4A35F, #B8863C)' : 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            padding: '8px',
                            cursor: 'pointer',
                            transition: 'transform 0.15s'
                          }}
                          onClick={() => {
                            playSoundSequence([{
                              midi: note.midi,
                              cents: note.cents,
                              duration: 0.6
                            }])
                          }}
                        >
                          <span style={{ fontSize: '0.7rem', color: index === 0 ? '#0F0805' : 'var(--text-muted)', fontWeight: 600 }}>deg {index + 1}</span>
                          <span style={{ fontSize: '0.85rem', color: index === 0 ? '#0F0805' : 'var(--text-primary)', fontWeight: 700 }}>{note.name}</span>
                          {isMicrotonal && (
                            <span className="badge badge-gold" style={{ fontSize: '0.55rem', padding: '1px 4px', marginTop: '4px' }}>
                              -50¢
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Jins Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 className="heading-md" style={{ color: 'var(--text-primary)' }}>{selectedJins.name}</h2>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{selectedJins.arabicName}</p>
                  </div>
                  <span className="badge badge-gold">{selectedJins.notesCount} Notes</span>
                </div>

                <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                  {selectedJins.description}
                </p>

                <div className="divider" />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Scale Notes:</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{selectedJins.notesText}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tonic note (Root):</span>
                    <span style={{ fontWeight: 600 }}>{selectedJins.tonic}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Ghammad note (Dominant):</span>
                    <span style={{ fontWeight: 600 }}>{selectedJins.ghammad}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Step Intervals (Tones):</span>
                    <span style={{ fontWeight: 600 }}>{selectedJins.intervals}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: EAR TRAINING HUB */}
          {activeTab === 'quiz' && (
            <motion.div
              key="quiz-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ textAlign: 'center', padding: '16px' }}
            >
              {quizStatus === 'idle' ? (
                <div>
                  <h3 className="heading-md mb-2">Ajnas Ear Trainer Quiz</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 24px' }}>
                    Listen to a random Jins melodic fragment containing microtonal quarter-tones. Identify the correct Jins to score points and earn XP!
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '24px' }}>
                    <div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>{score}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Correct Answers</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--warning)' }}>{streak}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Streak</div>
                    </div>
                  </div>

                  <button onClick={startQuizQuestion} className="btn-primary">
                    Start Ear Training
                  </button>
                </div>
              ) : (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Identify the scale played:</span>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span className="badge badge-gold">Streak: {streak}</span>
                      <span className="badge badge-success">Score: {score}</span>
                    </div>
                  </div>

                  {/* Play controller card */}
                  <div className="card-elevated" style={{ padding: '24px', marginBottom: '24px' }}>
                    <button
                      onClick={replayQuizJins}
                      className="btn-primary"
                      style={{ width: '64px', height: '64px', borderRadius: '50%', justifyContent: 'center', margin: '0 auto 12px' }}
                    >
                      <Volume2 size={24} />
                    </button>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click to replay melody fragment</div>
                  </div>

                  {/* Choices list */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {quizOptions.map(option => {
                      const isSelected = selectedAnswer === option.name
                      const isCorrect = option.name === quizJins?.name
                      const showResult = quizStatus === 'answered'

                      let btnStyle: React.CSSProperties = {
                        width: '100%',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center'
                      }

                      if (showResult) {
                        if (isCorrect) {
                          btnStyle.background = 'rgba(34,197,94,0.15)'
                          btnStyle.borderColor = 'var(--success)'
                          btnStyle.color = 'var(--success)'
                        } else if (isSelected) {
                          btnStyle.background = 'rgba(239,68,68,0.15)'
                          btnStyle.borderColor = 'var(--error)'
                          btnStyle.color = 'var(--error)'
                        }
                      } else {
                        if (isSelected) {
                          btnStyle.borderColor = 'var(--primary)'
                        }
                      }

                      return (
                        <button
                          key={option.name}
                          onClick={() => handleAnswerSubmit(option.name)}
                          disabled={showResult}
                          style={btnStyle}
                        >
                          {option.name}
                        </button>
                      )
                    })}
                  </div>

                  {/* Feedback and next button */}
                  {quizStatus === 'answered' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      {selectedAnswer === quizJins?.name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600 }}>
                          <CheckCircle2 size={16} /> Correct! +25 XP granted!
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)', fontSize: '0.9rem', fontWeight: 600 }}>
                          <AlertCircle size={16} /> Wrong! The correct answer was: {quizJins?.name}
                        </div>
                      )}
                      <button onClick={startQuizQuestion} className="btn-primary" style={{ padding: '8px 24px' }}>
                        Next Question
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: MAQAM WORLD REFERENCE */}
          {activeTab === 'reference' && (
            <motion.div
              key="reference-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 className="heading-md" style={{ color: 'var(--text-primary)' }}>
                    🌍 Maqam World — Full Reference
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Browse the complete Arabic music theory encyclopedia directly inside Maestro AI
                  </p>
                </div>
                <a
                  href="https://www.maqamworld.com/fr/jins.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '7px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ExternalLink size={13} /> Open in New Tab
                </a>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {[
                  { label: '🎵 Ajnas (Jins)',    url: 'https://www.maqamworld.com/fr/jins.php' },
                  { label: '🎼 Maqamat',          url: 'https://www.maqamworld.com/fr/maqam.php' },
                  { label: '🥁 Rythmes',          url: 'https://www.maqamworld.com/fr/rythme.php' },
                  { label: '🎻 Instruments',      url: 'https://www.maqamworld.com/fr/instrument.php' },
                  { label: '📖 Formes',           url: 'https://www.maqamworld.com/fr/forme.php' },
                  { label: '📚 Publications',     url: 'https://www.maqamworld.com/fr/publication.php' },
                ].map(link => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--primary)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: '#fff',
                position: 'relative',
              }}>
                <iframe
                  src="https://www.maqamworld.com/fr/jins.php"
                  title="Maqam World — Jins Reference"
                  style={{
                    width: '100%',
                    height: '680px',
                    border: 'none',
                    display: 'block',
                  }}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  loading="lazy"
                />
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' }}>
                Content provided by <a href="https://www.maqamworld.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>maqamworld.com</a> — an encyclopedic resource on Arabic music theory.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
