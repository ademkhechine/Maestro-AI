import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import {
  Play, Upload, Flame, Trophy, Clock, TrendingUp,
  Target, Zap, Music, Star, ChevronRight, BarChart2, Loader2, AlertCircle
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

interface RecentSession {
  id: string
  piece_id: string | null
  piece_title: string
  piece_composer: string
  piece_instrument: string
  duration_seconds: number
  overall_score: number
  xp_earned: number
  started_at: string
}

interface WeeklyChartItem {
  date: string
  label: string
  minutes: number
  score: number
}

interface DashboardStats {
  today_minutes: number
  today_goal_minutes: number
  today_progress_pct: number
  current_streak: number
  longest_streak: number
  total_xp: number
  current_level: number
  pieces_mastered: number
  average_accuracy: number
  week_sessions: number
  week_avg_score: number
  total_practice_minutes: number
  weekly_chart: WeeklyChartItem[]
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <motion.div className="card" style={{ padding: '18px' }} whileHover={{ y: -2 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>
          {label}
        </span>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <div className="heading-md" style={{ color: 'var(--text-primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', marginTop: '3px', color: 'var(--text-muted)' }}>{sub}</div>}
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass" style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem' }}>
      <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>{label}</div>
      <div style={{ color: 'var(--primary)' }}>{payload[0]?.value} min</div>
      {payload[1] && <div style={{ color: 'var(--success)' }}>{payload[1]?.value}% accuracy</div>}
    </div>
  )
}

const getInstrumentIcon = (instr?: string) => {
  const i = instr?.toLowerCase()
  if (i === 'piano') return '🎹'
  if (i === 'violin') return '🎻'
  if (i === 'guitar') return '🎸'
  if (i === 'voice') return '🎤'
  if (i === 'oud') return '🎵'
  if (i === 'qanun') return '🎼'
  return '🎶'
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recent, setRecent] = useState<RecentSession[]>([])
  const [libraryCount, setLibraryCount] = useState(0)
  const [error, setError] = useState('')

  const quickActions = [
    { icon: Play, label: 'Continue Practice', color: '#D4A35F', to: '/practice', bg: 'rgba(212,163,95,0.12)' },
    { icon: Upload, label: 'Upload Sheet Music', color: '#22C55E', to: '/library', bg: 'rgba(34,197,94,0.1)' },
    { icon: BarChart2, label: 'View Statistics', color: '#818CF8', to: '/statistics', bg: 'rgba(129,140,248,0.1)' },
    { icon: Music, label: 'Music Library', color: '#F59E0B', to: '/library', bg: 'rgba(245,158,11,0.1)' },
  ]

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const [dashRes, recentRes, piecesRes] = await Promise.all([
          api.get('/api/v1/users/dashboard'),
          api.get('/api/v1/sessions/history?limit=3'),
          api.get('/api/v1/pieces')
        ])
        setStats(dashRes.data)
        setRecent(recentRes.data)
        setLibraryCount(piecesRes.data.length)
      } catch (err: any) {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading your dashboard...</p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center', maxWidth: '480px', margin: '40px auto' }}>
        <AlertCircle size={40} style={{ color: 'var(--error)', marginBottom: '16px' }} />
        <h3 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Failed to Load Dashboard</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
      </div>
    )
  }

  const todayMinutes = stats.today_minutes
  const goalMinutes = stats.today_goal_minutes || 30
  const goalPct = stats.today_progress_pct

  const getGreeting = () => {
    const hr = new Date().getHours()
    if (hr < 12) return 'Good morning'
    if (hr < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="page-stack">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="heading-lg" style={{ color: 'var(--text-primary)' }}>
              {getGreeting()}, <span className="text-gradient">{user?.full_name?.split(' ')[0]}</span> 👋
            </h1>
            <p style={{ marginTop: '4px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-warning"><Flame size={11} /> {stats.current_streak} day streak</span>
            <span className="badge badge-gold"><Zap size={11} /> Lv.{stats.current_level}</span>
          </div>
        </div>
      </motion.div>

      {/* Today's Goal */}
      <motion.div className="card" style={{ padding: '22px' }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px', color: 'var(--text-muted)' }}>
              Today's Practice Goal
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {todayMinutes} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/ {goalMinutes} min</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="text-gradient" style={{ fontSize: '2rem', fontWeight: 900 }}>{goalPct}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Complete</div>
          </div>
        </div>
        <div className="progress-bar" style={{ height: '8px' }}>
          <motion.div className="progress-fill"
            initial={{ width: 0 }} animate={{ width: `${goalPct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }} />
        </div>
        <p style={{ fontSize: '0.78rem', marginTop: '8px', color: 'var(--text-muted)' }}>
          {goalMinutes - todayMinutes > 0
            ? `${goalMinutes - todayMinutes} more minutes to reach your daily goal!`
            : '🎉 Daily goal achieved!'}
        </p>
      </motion.div>

      {/* Quick Actions */}
      <div className="stats-grid-4">
        {quickActions.map(({ icon: Icon, label, color, to, bg }, i) => (
          <motion.button key={i}
            onClick={() => navigate(to)}
            className="card"
            style={{ padding: '18px', textAlign: 'left', cursor: 'pointer', border: 'none', width: '100%' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
          </motion.button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid-4">
        {[
          { icon: Flame,      label: 'Current Streak', value: `${stats.current_streak}d`, sub: `Best: ${stats.longest_streak}d`, color: '#F59E0B' },
          { icon: Trophy,     label: 'Pieces Mastered', value: stats.pieces_mastered, sub: 'In your repertoire', color: '#D4A35F' },
          { icon: Clock,      label: 'Total Practice', value: `${Math.floor(stats.total_practice_minutes / 60)}h`, sub: `${stats.total_practice_minutes % 60}min`, color: '#818CF8' },
          { icon: TrendingUp, label: 'Avg. Accuracy', value: `${stats.average_accuracy.toFixed(1)}%`, sub: 'All sessions', color: '#22C55E' },
          { icon: Star,       label: 'Total XP', value: stats.total_xp.toLocaleString(), sub: `Level ${stats.current_level}`, color: '#D4A35F' },
          { icon: Target,     label: 'Daily Goal', value: `${goalPct}%`, sub: `${goalMinutes} min target`, color: '#F59E0B' },
          { icon: Zap,        label: 'Level', value: stats.current_level, sub: `${stats.total_xp % 1000}/1000 XP`, color: '#22C55E' },
          { icon: Music,      label: 'Library', value: libraryCount, sub: 'Pieces uploaded', color: '#818CF8' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 + i * 0.04 }}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Chart + Recent */}
      <div className="two-col">
        {/* Weekly Chart */}
        <motion.div className="card" style={{ padding: '22px' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 className="heading-md" style={{ color: 'var(--text-primary)' }}>Weekly Overview</h3>
              <p style={{ fontSize: '0.75rem', marginTop: '2px', color: 'var(--text-muted)' }}>Practice minutes & accuracy</p>
            </div>
            <span className="badge badge-gold">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.weekly_chart} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A35F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4A35F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,163,95,0.06)" />
              <XAxis dataKey="label" tick={{ fill: '#6B5C4E', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B5C4E', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="minutes" stroke="#D4A35F" strokeWidth={2} fill="url(#colorMinutes)" dot={{ fill: '#D4A35F', r: 3 }} />
              <Area type="monotone" dataKey="score" stroke="#22C55E" strokeWidth={2} fill="url(#colorScore)" dot={{ fill: '#22C55E', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div className="card" style={{ padding: '22px' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 className="heading-md" style={{ color: 'var(--text-primary)' }}>Recent Sessions</h3>
            <button onClick={() => navigate('/statistics')} className="btn-ghost" style={{ fontSize: '0.78rem', color: 'var(--primary)', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              See all <ChevronRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recent.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No sessions completed yet. Start your first practice session below!
              </div>
            ) : (
              recent.map((s, i) => (
                <motion.div key={i}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px', borderRadius: '10px', cursor: 'pointer', background: 'rgba(212,163,95,0.04)', border: '1px solid var(--border)' }}
                  whileHover={{ background: 'rgba(212,163,95,0.08)' }}
                  onClick={() => navigate('/practice')}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                    {getInstrumentIcon(s.piece_instrument)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.piece_title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.piece_composer} · {Math.round(s.duration_seconds / 60)} min · {new Date(s.started_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, flexShrink: 0, color: s.overall_score >= 90 ? 'var(--success)' : s.overall_score >= 75 ? 'var(--warning)' : 'var(--error)' }}>
                    {s.overall_score}%
                  </div>
                </motion.div>
              ))
            )}
          </div>
          <button onClick={() => navigate('/practice')} className="btn-primary" style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}>
            <Play size={15} /> Start Practicing
          </button>
        </motion.div>
      </div>
    </div>
  )
}
