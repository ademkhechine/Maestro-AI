import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar
} from 'recharts'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import {
  TrendingUp, Clock, Target, Flame, Calendar,
  Sparkles, AlertCircle, AlertTriangle, Play, Award, Brain, Loader2
} from 'lucide-react'

interface MonthlyData {
  day: number
  date: string
  minutes: number
  accuracy: number
  pitch: number
  rhythm: number
}

interface SkillRadar {
  subject: string
  value: number
  description: string
}

interface StatsData {
  total_practice_minutes: number
  pieces_mastered: number
  average_accuracy: number
  current_streak: number
  longest_streak: number
  total_xp: number
  current_level: number
  instrument: string
  monthly_data: MonthlyData[]
  skill_radar: SkillRadar[]
}

function CalendarHeatmap({ data }: { data: MonthlyData[] }) {
  // Pad with empty days if less than 35
  const paddedDays = [...data]
  while (paddedDays.length < 35) {
    paddedDays.unshift({
      day: 0,
      date: '',
      minutes: 0,
      accuracy: 0,
      pitch: 0,
      rhythm: 0
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>{d}</div>
        ))}
        {paddedDays.map((d, i) => (
          <motion.div
            key={i}
            title={d.date ? `${d.date}: ${d.minutes} minutes practiced` : 'No practice'}
            style={{
              aspectRatio: '1',
              borderRadius: '4px',
              border: '1px solid rgba(212,163,95,0.05)',
              background: d.minutes === 0 ? 'rgba(212,163,95,0.02)' :
                d.minutes > 45 ? 'rgba(212,163,95,0.9)' :
                d.minutes > 25 ? 'rgba(212,163,95,0.6)' :
                d.minutes > 10 ? 'rgba(212,163,95,0.35)' : 'rgba(212,163,95,0.15)',
              cursor: d.date ? 'pointer' : 'default'
            }}
            whileHover={d.date ? { scale: 1.15, zIndex: 10, borderColor: 'var(--primary)' } : {}}
          />
        ))}
      </div>
    </div>
  )
}

export default function StatisticsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'plan'>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const res = await api.get('/api/v1/statistics/overview')
        setStats(res.data)
      } catch (err: any) {
        setError('Failed to fetch practice statistics.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading performance analytics...</p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center', maxWidth: '480px', margin: '40px auto' }}>
        <AlertCircle size={40} style={{ color: 'var(--error)', marginBottom: '16px' }} />
        <h3 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Failed to Load Statistics</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
      </div>
    )
  }

  // Find the weakest skill from the radar list dynamically
  const weakestSkill = [...stats.skill_radar].sort((a, b) => a.value - b.value)[0]

  // Answers to the 6 Core Dashboard Questions
  const dashboardQuestions = [
    {
      id: 'practice-today',
      question: 'What should I practice today?',
      answer: user?.instrument === 'oud' || user?.instrument === 'qanun' 
        ? 'Bayati Maqam quarter-tone drone practice + Rast Modulation'
        : 'C Major arpeggio consistency + pieces in your library',
      detail: 'Focus on pitch matching and slow down the tempo transitions.',
      icon: Sparkles,
      color: '#D4A35F',
      action: 'Start Practice Plan'
    },
    {
      id: 'improved-since-yesterday',
      question: 'What improved since yesterday?',
      answer: stats.average_accuracy > 80 
        ? 'Tempo stability in high registers (+4.2% accuracy)'
        : 'Initial pitch calibration & warmup alignment',
      detail: 'Synchronizing exercises with visual feedback successfully aligned.',
      icon: TrendingUp,
      color: '#22C55E',
      action: 'View Historical Data'
    },
    {
      id: 'weakest-skill',
      question: 'What is my weakest skill?',
      answer: `${weakestSkill.subject} (${weakestSkill.value}%)`,
      detail: `Your ${weakestSkill.subject.toLowerCase()} shows the most room for improvement compared to others.`,
      icon: AlertCircle,
      color: '#EF4444',
      action: 'Launch Skill Drills'
    },
    {
      id: 'next-goal',
      question: 'What is my next goal?',
      answer: 'Master target piece (90% accuracy target)',
      detail: `Currently sitting at ${stats.average_accuracy.toFixed(1)}% average accuracy. Master a new piece to level up.`,
      icon: Target,
      color: '#D97706',
      action: 'View Achievements'
    },
    {
      id: 'consistency',
      question: 'How consistent am I?',
      answer: `Current Streak: ${stats.current_streak} Days`,
      detail: `You have practiced ${stats.total_practice_minutes} total minutes on ${stats.instrument}. Keep it up!`,
      icon: Flame,
      color: '#F59E0B',
      action: 'Check Consistency'
    },
    {
      id: 'fix-first',
      question: 'What should I fix first?',
      answer: weakestSkill.value < 75 
        ? `Calibrate your ${weakestSkill.subject.toLowerCase()}`
        : 'Pacing in transitions between measures',
      detail: 'Identify rushed segments in the practice tuner loop.',
      icon: AlertTriangle,
      color: '#EF4444',
      action: 'Analyze Last Playback'
    }
  ]

  // Adaptive 7-day practice plan generated dynamically based on weaknesses
  const adaptivePracticePlan = [
    { day: 'Day 1', focus: `${weakestSkill.subject} calibration & warmup`, duration: '30 mins', tasks: [`Targeted exercises for ${weakestSkill.subject.toLowerCase()}`, 'Intonation matching via pitch visualizer'] },
    { day: 'Day 2', focus: 'Sight-Reading & Structural Reading', duration: '40 mins', tasks: ['First sight-read of standard exercises (No helpers)', 'Analyze measure patterns and rhythmic values'] },
    { day: 'Day 3', focus: 'Rhythm Sync & Subdivision Control', duration: '30 mins', tasks: ['Set metronome to 60 BPM, play subdivisions with clear downbeat accents', 'Tempo transition build-ups'] },
    { day: 'Day 4', focus: 'Dynamic Range & Voice Control', duration: '35 mins', tasks: ['Vary dynamics from Pianissimo (pp) to Fortissimo (ff) in steps', 'Balance accompaniment volume vs melody projection'] },
    { day: 'Day 5', focus: 'Whole-Piece Tempo Continuity', duration: '45 mins', tasks: ['Full run-throughs at 85% speed without stopping', 'Mark transition measures for post-session loops'] },
    { day: 'Day 6', focus: 'Microtonal Modulation (Jins & Transition)', duration: '40 mins', tasks: ['Modulation practice from Rast to Bayati scales', 'Traditional ornamentation and pitch bend exercises'] },
    { day: 'Day 7', focus: 'Performance Session & AI Teacher Assessment', duration: '30 mins', tasks: ['Record active pieces for deep audio/pitch alignment feedback', 'Compare result metrics with last week\'s averages'] }
  ]

  return (
    <div className="page-stack">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-gold">
              <Award size={12} /> Level {stats.current_level} Musician
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Instrument: {stats.instrument.toUpperCase()}
            </span>
          </div>
          <h1 className="heading-lg mt-1" style={{ color: 'var(--text-primary)' }}>Performance Analytics</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Your personal adaptive statistics console answering the key metrics of your musical progress.
          </p>
        </motion.div>

        {/* Tab Selection */}
        <div className="card" style={{ padding: '4px', display: 'flex', gap: '4px', background: 'var(--bg-surface)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn-ghost ${activeTab === 'overview' ? 'active' : ''}`}
            style={{ fontSize: '0.8rem', borderRadius: '8px', padding: '6px 16px' }}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`btn-ghost ${activeTab === 'plan' ? 'active' : ''}`}
            style={{ fontSize: '0.8rem', borderRadius: '8px', padding: '6px 16px' }}
          >
            <Brain size={13} style={{ marginRight: '6px' }} />
            Adaptive Practice Plan
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Section title: Essential Performance Insights */}
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <h2 className="heading-md" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🧠 Adaptive Coach Insights
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>The core system metrics driving your daily practice loop.</p>
          </div>

          {/* 6 Questions Answered Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {dashboardQuestions.map((q, idx) => {
              const Icon = q.icon
              return (
                <motion.div
                  key={q.id}
                  className="card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4, borderColor: 'var(--border-hover)' }}
                >
                  {/* Subtle background glow */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-15%',
                      right: '-10%',
                      width: '80px',
                      height: '80px',
                      background: `${q.color}08`,
                      borderRadius: '50%',
                      filter: 'blur(20px)',
                      pointerEvents: 'none'
                    }}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: `${q.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon size={14} style={{ color: q.color }} />
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {q.question}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {q.answer}
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {q.detail}
                    </p>
                  </div>

                  <button
                    className="btn-ghost"
                    style={{
                      padding: '4px 0px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      alignSelf: 'flex-start',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {q.action} &rarr;
                  </button>
                </motion.div>
              )
            })}
          </div>

          {/* Trend Charts row */}
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginTop: '16px' }}>
            <h2 className="heading-md" style={{ color: 'var(--text-primary)' }}>📈 Progress Trends</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Historical analysis of accuracy levels and daily engagement.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '16px' }}>
            
            {/* Chart 1: Accuracy & Pitch */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 className="heading-sm" style={{ color: 'var(--text-primary)' }}>Performance & Intonation Tracking</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Compare overall execution accuracy with raw pitch precision</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.monthly_data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="accuracyGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4A35F" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#D4A35F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,163,95,0.06)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#8A7A6E', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#8A7A6E', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '11px', color: 'var(--text-primary)' }} />
                  <Line type="monotone" name="Overall Accuracy" dataKey="accuracy" stroke="#D4A35F" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" name="Pitch Calibration" dataKey="pitch" stroke="#22C55E" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                  <Line type="monotone" name="Rhythmic Precision" dataKey="rhythm" stroke="#818CF8" strokeWidth={1.5} dot={false} strokeDasharray="5 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Daily practice time */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 className="heading-sm" style={{ color: 'var(--text-primary)' }}>Practice Time Allocation</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Minutes spent building muscle memory in last 14 sessions</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.monthly_data.slice(-14)} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,163,95,0.06)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#8A7A6E', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8A7A6E', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '11px', color: 'var(--text-primary)' }} />
                  <Bar name="Minutes Practiced" dataKey="minutes" fill="#D4A35F" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Radar Profile & Calendar Heatmap Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '16px' }}>

            {/* Skill Profile Radar */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 className="heading-sm" style={{ color: 'var(--text-primary)', margin: 0 }}>Technical Skill Profile</h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Radar breakdown across standard and microtonal attributes.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={stats.skill_radar}>
                    <PolarGrid stroke="rgba(212,163,95,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#A89880', fontSize: 9, fontWeight: 600 }} />
                    <Radar name="Skills Profile" dataKey="value" stroke="#D4A35F" fill="#D4A35F" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {stats.skill_radar.map((skill) => (
                    <div key={skill.subject} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{skill.subject}</span>
                        <span style={{ color: 'var(--primary)' }}>{skill.value}%</span>
                      </div>
                      <div style={{ height: '3px', background: 'rgba(212,163,95,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${skill.value}%`, background: 'var(--primary)', borderRadius: '2px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Practice Calendar Heatmap */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 className="heading-sm" style={{ color: 'var(--text-primary)', margin: 0 }}>Practice Consistency</h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Daily activity heatmap highlighting streak persistence.</p>
                </div>
              </div>
              
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '340px' }}>
                  <CalendarHeatmap data={stats.monthly_data} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Less</span>
                {[0.15, 0.35, 0.6, 0.9].map((op, i) => (
                  <div key={i} style={{ width: '10px', height: '10px', borderRadius: '2px', background: `rgba(212,163,95,${op})` }} />
                ))}
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>More</span>
              </div>
            </div>

          </div>
        </>
      )}

      {activeTab === 'plan' && (
        <motion.div
          className="card"
          style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(212,163,95,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              🧠
            </div>
            <div>
              <h2 className="heading-md" style={{ color: 'var(--text-primary)', margin: 0 }}>Adaptive Practice Plan</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Generated by Maestro AI based on your pitch calibration, sight-reading, and tempo metrics.</p>
            </div>
            <button className="btn-primary" style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '8px 16px' }}>
              <Play size={12} fill="currentColor" /> Resume Current Exercise
            </button>
          </div>

          <div className="divider" />

          {/* Daily Schedule Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {adaptivePracticePlan.map((d, index) => (
              <div
                key={d.day}
                className="card"
                style={{
                  padding: '16px 20px',
                  background: 'var(--bg-surface)',
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr 120px',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)' }}>{d.day}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Adaptive Target</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.focus}</div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {d.tasks.map((task, i) => (
                      <span key={i} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                        {task}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.duration}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Est. Practice Time</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
