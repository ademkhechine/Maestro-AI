import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import { Lock, CheckCircle, Award, Trophy, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xp_reward: number
  category: string
  earned: boolean
}

interface AchievementsData {
  achievements: Achievement[]
  earned_count: number
  total_count: number
  bonus_xp: number
}

const CATEGORIES = ['All', 'Practice', 'Streak', 'Accuracy', 'Library', 'Arabic Music', 'Fun']

export default function AchievementsPage() {
  const { user } = useAuthStore()
  const [selectedCat, setSelectedCat] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<AchievementsData | null>(null)

  const loadAchievements = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/api/v1/achievements/')
      setData(res.data)
    } catch (err: any) {
      setError('Failed to load achievements. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAchievements()
  }, [loadAchievements])

  const filtered = data?.achievements.filter(a =>
    selectedCat === 'All' || a.category === selectedCat
  ) ?? []

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading your achievements...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center', maxWidth: '480px', margin: '40px auto' }}>
        <AlertCircle size={40} style={{ color: 'var(--error)', marginBottom: '16px' }} />
        <h3 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Failed to Load Achievements</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>{error}</p>
        <button onClick={loadAchievements} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}>
          <RefreshCw size={14} /> Try Again
        </button>
      </div>
    )
  }

  const progressPct = Math.round((data.earned_count / data.total_count) * 100)

  return (
    <div className="page-stack">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="heading-lg" style={{ color: 'var(--text-primary)' }}>Musical Achievements</h1>
        <p style={{ marginTop: '4px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Unlock milestone badges as you develop your musical skills and build consistent practice habits.
        </p>
      </motion.div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <motion.div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(212,163,95,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={22} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Badges Earned</div>
            <div className="heading-md" style={{ color: 'var(--text-primary)', marginTop: '2px' }}>
              {data.earned_count} / {data.total_count}
            </div>
          </div>
        </motion.div>

        <motion.div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={22} style={{ color: 'var(--success)' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bonus XP Earned</div>
            <div className="heading-md" style={{ color: 'var(--text-primary)', marginTop: '2px' }}>
              {data.bonus_xp.toLocaleString()} XP
            </div>
          </div>
        </motion.div>

        <motion.div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', gridColumn: 'span 2' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Overall Achievement Progress</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)' }}>{progressPct}%</span>
          </div>
          <div className="progress-bar" style={{ height: '8px' }}>
            <motion.div className="progress-fill"
              initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }} />
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {data.total_count - data.earned_count} badges remaining to unlock. Keep practicing to earn them all!
          </p>
        </motion.div>
      </div>

      {/* Category filter */}
      <div className="card" style={{ padding: '12px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className="btn-ghost"
            style={{
              fontSize: '0.75rem',
              padding: '6px 14px',
              borderRadius: '8px',
              background: selectedCat === cat ? 'rgba(212,163,95,0.1)' : 'transparent',
              border: selectedCat === cat ? '1px solid var(--primary)' : '1px solid transparent',
              color: selectedCat === cat ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Achievements grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        <AnimatePresence mode="popLayout">
          {filtered.map((a, idx) => (
            <motion.div
              key={a.id}
              className="card"
              style={{
                padding: '16px',
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                border: a.earned ? '1.5px solid rgba(212,163,95,0.3)' : '1.5px solid var(--border)',
                background: a.earned ? 'rgba(212,163,95,0.03)' : 'var(--bg-card)',
                opacity: a.earned ? 1 : 0.55,
                position: 'relative',
                overflow: 'hidden'
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: a.earned ? 1 : 0.55, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.03 }}
              whileHover={{ y: a.earned ? -3 : 0, borderColor: a.earned ? 'var(--primary)' : undefined }}
            >
              {/* Earned glow effect */}
              {a.earned && (
                <div style={{
                  position: 'absolute',
                  top: '-30%', right: '-10%',
                  width: '80px', height: '80px',
                  background: 'rgba(212,163,95,0.06)',
                  borderRadius: '50%',
                  filter: 'blur(20px)',
                  pointerEvents: 'none'
                }} />
              )}

              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '12px',
                  background: a.earned
                    ? 'linear-gradient(135deg, rgba(212,163,95,0.2), rgba(217,119,6,0.15))'
                    : 'rgba(255,255,255,0.03)',
                  border: a.earned ? '1px solid rgba(212,163,95,0.4)' : '1px solid var(--border)',
                  fontSize: '2rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {a.icon}
                </div>
                <div style={{
                  position: 'absolute', bottom: '-4px', right: '-4px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: a.earned ? 'var(--success)' : 'var(--bg-elevated)',
                  border: '1.5px solid var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {a.earned
                    ? <CheckCircle size={11} style={{ color: '#0F0805' }} />
                    : <Lock size={9} style={{ color: 'var(--text-muted)' }} />
                  }
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{a.name}</h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 8px 0', lineHeight: 1.3 }}>{a.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span className="badge badge-gold" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>+{a.xp_reward} XP</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    {a.category}
                  </span>
                  {!a.earned && (
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Locked</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Trophy size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No achievements in this category yet</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Keep practicing to unlock badges across all categories.
          </p>
        </div>
      )}
    </div>
  )
}
