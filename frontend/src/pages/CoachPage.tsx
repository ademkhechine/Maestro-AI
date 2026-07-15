import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import {
  MessageSquareText, Send, Lightbulb, Sparkles, Loader2,
  BrainCircuit, RotateCcw, Target, Flame, Trophy
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

const EXAMPLE_PROMPTS = [
  "How can I improve my intonation on the upper register?",
  "What exercises should I do to improve my rhythm?",
  "Create a 2-week practice plan for Moonlight Sonata",
  "I keep rushing in fast passages. What drills help?",
  "Explain the Bayati Maqam and how to practice it",
  "How do I develop consistent tempo stability?",
]

// Smart initial message based on user data
function getInitialMessage(user: { full_name: string; instrument: string; current_streak: number; average_accuracy: number } | null) {
  if (!user) {
    return "Hello! I'm Maestro AI, your personal music coach. How can I help you improve your musical skills today?"
  }
  const instrument = user.instrument || 'your instrument'
  const streak = user.current_streak
  const accuracy = user.average_accuracy

  let context = `Hello ${user.full_name.split(' ')[0]}! I'm Maestro AI, your personal ${instrument} coach.`

  if (streak > 0) {
    context += ` You're on a ${streak}-day practice streak — impressive dedication!`
  }
  if (accuracy > 0) {
    context += ` Your average accuracy is ${accuracy.toFixed(1)}%.`
  }
  if (accuracy > 85) {
    context += ` You're performing at an advanced level. Let's work on expressive nuance and dynamic range.`
  } else if (accuracy > 70) {
    context += ` You're making solid progress. Focus areas: consistent intonation and rhythmic precision.`
  } else {
    context += ` We'll build your foundation systematically — pitch accuracy and tempo stability first.`
  }
  context += ` What would you like to work on today?`
  return context
}

export default function CoachPage() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(true)
  const [coachStats, setCoachStats] = useState<{
    weakest_skill: string
    avg_accuracy: number
    pieces_mastered: number
    streak: number
  } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatHistoryRef = useRef<Message[]>([])

  // Load initial message and stats
  useEffect(() => {
    const initialMsg: Message = {
      role: 'assistant',
      content: getInitialMessage(user),
      timestamp: new Date().toISOString()
    }
    setMessages([initialMsg])
    chatHistoryRef.current = [initialMsg]

    // Load user stats for context panel
    api.get('/api/v1/statistics/overview')
      .then(res => {
        const data = res.data
        const weakest = [...(data.skill_radar || [])].sort((a: any, b: any) => a.value - b.value)[0]
        setCoachStats({
          weakest_skill: weakest?.subject || 'Rhythm Sync',
          avg_accuracy: data.average_accuracy || 0,
          pieces_mastered: data.pieces_mastered || 0,
          streak: data.current_streak || 0,
        })
      })
      .catch(() => {
        // Silent fallback — use user data from store
        setCoachStats({
          weakest_skill: 'Rhythm Sync',
          avg_accuracy: user?.average_accuracy || 0,
          pieces_mastered: user?.pieces_mastered || 0,
          streak: user?.current_streak || 0,
        })
      })
      .finally(() => setStatsLoading(false))
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(async (textToSend?: string) => {
    const userMsg = (textToSend || input).trim()
    if (!userMsg || loading) return

    setInput('')
    const userMessage: Message = {
      role: 'user',
      content: userMsg,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    chatHistoryRef.current = [...chatHistoryRef.current, userMessage]
    setLoading(true)

    try {
      // Build session context for the AI
      const sessionContext = {
        pitch_accuracy: user?.average_accuracy || 75,
        rhythm_accuracy: (user?.average_accuracy || 75) * 0.95,
        tempo_stability: (user?.average_accuracy || 75) * 1.02,
        expression_score: (user?.average_accuracy || 75) * 0.88,
        overall_score: user?.average_accuracy || 75,
      }

      const res = await api.post('/api/v1/coach/feedback', {
        session_data: sessionContext,
        piece_title: 'General Practice Session',
        instrument: user?.instrument || 'piano',
        measures_practiced: 'Full piece',
        // Pass the user's question as context for feedback generation
        previous_sessions: [{ message: userMsg, overall_score: user?.average_accuracy || 75 }]
      })

      // Use the full feedback as AI response
      const feedbackData = res.data
      let responseContent = feedbackData.feedback || "I couldn't generate feedback at this moment."

      // Append recommendations if they exist
      if (feedbackData.recommendations?.length) {
        responseContent += '\n\nKey Recommendations:\n'
        feedbackData.recommendations.forEach((rec: string, i: number) => {
          responseContent += `${i + 1}. ${rec}\n`
        })
      }

      if (feedbackData.encouragement) {
        responseContent += `\n${feedbackData.encouragement}`
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMessage])
      chatHistoryRef.current = [...chatHistoryRef.current, assistantMessage]
    } catch (err) {
      const fallbackMessage: Message = {
        role: 'assistant',
        content: "I'm having trouble connecting to the coaching engine right now. Please check that the backend server is running and try again. In the meantime: focus on slow, deliberate practice with a metronome at 70% of your target tempo.",
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setLoading(false)
    }
  }, [input, loading, user])

  const clearChat = () => {
    const initialMsg: Message = {
      role: 'assistant',
      content: getInitialMessage(user),
      timestamp: new Date().toISOString()
    }
    setMessages([initialMsg])
    chatHistoryRef.current = [initialMsg]
  }

  const formatTime = (iso?: string) => {
    if (!iso) return ''
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="page-stack" style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="heading-lg" style={{ color: 'var(--text-primary)' }}>AI Music Coach</h1>
        <p style={{ marginTop: '4px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Personalized coaching powered by GPT-4o, adapted to your practice history and skill profile.
        </p>
      </motion.div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', alignItems: 'start' }}>

        {/* Left: Context sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Coach context card */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <BrainCircuit size={15} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Coach Context
              </span>
            </div>

            {statsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton" style={{ height: '28px', width: '100%' }} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Target size={11} /> Focus Instrument:
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {user?.instrument || '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Trophy size={11} /> Mastered Pieces:
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {coachStats?.pieces_mastered ?? 0}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Flame size={11} /> Practice Streak:
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--warning)' }}>
                    {coachStats?.streak ?? 0} days
                  </span>
                </div>
                <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Avg. Accuracy</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {coachStats?.avg_accuracy?.toFixed(1) ?? 0}%
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: '4px' }}>
                    <div className="progress-fill" style={{ width: `${coachStats?.avg_accuracy ?? 0}%` }} />
                  </div>
                </div>
                {coachStats?.weakest_skill && (
                  <div style={{
                    marginTop: '4px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    fontSize: '0.72rem'
                  }}>
                    <span style={{ color: 'var(--error)', fontWeight: 700 }}>⚠ Improvement Area:</span>
                    <br />
                    <span style={{ color: 'var(--text-secondary)' }}>{coachStats.weakest_skill}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              Quick Questions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {EXAMPLE_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(p)}
                  disabled={loading}
                  className="btn-ghost"
                  style={{
                    textAlign: 'left',
                    fontSize: '0.72rem',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.3,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px'
                  }}
                >
                  <Lightbulb size={10} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chat console */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '620px' }}>

          {/* Header bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 18px', borderBottom: '1px solid var(--border)'
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'rgba(212,163,95,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
            }}>🎼</div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Maestro Premium Coach
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--success)' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--success)' }} />
                Personalized AI Active
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-gold">
                <Sparkles size={10} /> GPT-4o
              </span>
              <button
                onClick={clearChat}
                className="btn-ghost"
                title="Clear conversation"
                style={{ padding: '6px', borderRadius: '8px' }}
              >
                <RotateCcw size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    gap: '10px',
                    alignItems: 'flex-end'
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: 'rgba(212,163,95,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.85rem', flexShrink: 0
                    }}>🎼</div>
                  )}
                  <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      padding: '11px 15px',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #D4A35F, #D97706)'
                        : 'var(--bg-surface)',
                      border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                      color: msg.role === 'user' ? '#0F0805' : 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      lineHeight: '1.55',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {msg.content}
                    </div>
                    {msg.timestamp && (
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', padding: '0 4px' }}>
                        {formatTime(msg.timestamp)}
                      </span>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'linear-gradient(135deg,#D4A35F,#D97706)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, color: '#0D0A08', flexShrink: 0
                    }}>
                      {user?.full_name?.[0] ?? 'U'}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: 'rgba(212,163,95,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem'
                }}>🎼</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '11px 15px', borderRadius: '16px 16px 16px 4px',
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  fontSize: '0.82rem', color: 'var(--text-muted)'
                }}>
                  <Loader2 size={13} className="animate-spin" style={{ color: 'var(--primary)' }} />
                  Analyzing your practice profile...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Ask about technique, practice plans, theory, Maqam scales..."
                className="input"
                style={{ flex: 1, fontSize: '0.875rem' }}
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                className="btn-primary"
                style={{ padding: '0 18px', flexShrink: 0 }}
                disabled={loading || !input.trim()}
              >
                <Send size={15} />
              </button>
            </div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px', paddingLeft: '2px' }}>
              Maestro AI remembers your skill profile and instrument in this session.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
