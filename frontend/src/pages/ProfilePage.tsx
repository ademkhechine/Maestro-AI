import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import { Camera, Save, Flame, Trophy, Clock, Target, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const INSTRUMENTS = [
  { value: 'piano', label: '🎹 Piano' },
  { value: 'violin', label: '🎻 Violin' },
  { value: 'guitar', label: '🎸 Guitar' },
  { value: 'voice', label: '🎤 Voice' },
  { value: 'oud', label: '🎵 Oud' },
  { value: 'qanun', label: '🎼 Qanun' },
  { value: 'nay', label: '💨 Nay' },
  { value: 'flute', label: '🎶 Flute' },
]

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Professional']

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    bio: user?.bio ?? '',
    instrument: user?.instrument ?? 'piano',
    experience_level: user?.experience_level ?? 'beginner',
    daily_goal_minutes: user?.daily_goal_minutes ?? 30,
  })

  const handleSave = async () => {
    setSaving(true)
    setStatusMessage(null)
    try {
      const res = await api.patch('/api/v1/users/me', form)
      updateUser(res.data)
      setEditing(false)
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to update profile. Please try again.',
      })
    } finally {
      setSaving(false)
    }
  }

  // Proper level XP percentage calculation
  const currentLevel = user?.current_level ?? 1
  const totalXp = user?.total_xp ?? 0
  const nextLevelXp = currentLevel * 1000
  const currentLevelMinXp = (currentLevel - 1) * 1000
  const levelProgress = Math.max(0, totalXp - currentLevelMinXp)
  const levelPct = Math.min(100, Math.max(0, (levelProgress / 1000) * 100))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '896px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="heading-lg" style={{ color: 'var(--text-primary)' }}>Profile Preferences</h1>
      </motion.div>

      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: statusMessage.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${statusMessage.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            color: statusMessage.type === 'success' ? 'var(--success)' : 'var(--error)',
            fontSize: '0.875rem',
          }}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {statusMessage.text}
        </motion.div>
      )}

      {/* Profile header card */}
      <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #D4A35F, #D97706)',
                color: '#0F0805',
              }}
            >
              {user?.full_name?.[0] ?? '?'}
            </div>
            <button
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <Camera size={13} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          {/* User Details */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            {editing ? (
              <input
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                className="input"
                style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px', width: '100%', maxWidth: '320px' }}
                id="profile-name"
              />
            ) : (
              <h2 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>
                {user?.full_name}
              </h2>
            )}
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              @{user?.username} · {user?.email}
            </p>

            {editing ? (
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                className="input"
                rows={2}
                style={{ fontSize: '0.875rem', width: '100%', resize: 'none' }}
                placeholder="Tell us about your musical journey..."
              />
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {user?.bio || 'No bio yet. Click Edit to add one.'}
              </p>
            )}

            {/* Level progression bar */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Level {currentLevel}</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {totalXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
                </span>
              </div>
              <div className="progress-bar" style={{ height: '6px', width: '100%', maxWidth: '320px' }}>
                <motion.div
                  className="progress-fill"
                  style={{ width: `${levelPct}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${levelPct}%` }}
                  transition={{ duration: 1.2 }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setForm({
                      full_name: user?.full_name ?? '',
                      bio: user?.bio ?? '',
                      instrument: user?.instrument ?? 'piano',
                      experience_level: user?.experience_level ?? 'beginner',
                      daily_goal_minutes: user?.daily_goal_minutes ?? 30,
                    })
                    setEditing(false)
                  }}
                  className="btn-ghost"
                  disabled={saving}
                  style={{ fontSize: '0.875rem' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary"
                  disabled={saving}
                  style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-secondary" style={{ fontSize: '0.875rem' }}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {[
          { icon: Flame, label: 'Streak', value: `${user?.current_streak ?? 0} days`, color: '#F59E0B' },
          { icon: Trophy, label: 'Pieces Mastered', value: user?.pieces_mastered ?? 0, color: '#D4A35F' },
          { icon: Clock, label: 'Hours Practiced', value: `${Math.floor((user?.total_practice_minutes ?? 0) / 60)}h`, color: '#818CF8' },
          { icon: Target, label: 'Avg. Accuracy', value: `${user?.average_accuracy?.toFixed(1) ?? 0}%`, color: '#22C55E' },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={i}
            className="card"
            style={{ padding: '16px', textAlign: 'center' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <Icon size={20} style={{ color, margin: '0 auto 8px' }} />
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Preferences Section */}
      <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>
          Preferences & Practice Settings
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Instrument select */}
          <div>
            <label className="input-label" style={{ marginBottom: '8px' }}>
              Primary Instrument
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              {INSTRUMENTS.map(({ value, label }) => {
                const currentVal = editing ? form.instrument : user?.instrument
                const isSelected = currentVal?.toLowerCase() === value
                return (
                  <label key={value} style={{ cursor: editing ? 'pointer' : 'default' }}>
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => setForm((f) => ({ ...f, instrument: value }))}
                      disabled={!editing}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        background: isSelected ? 'rgba(212,163,95,0.1)' : 'var(--bg-surface)',
                        color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                        opacity: !editing && !isSelected ? 0.6 : 1,
                      }}
                    >
                      {label}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Experience level select */}
          <div>
            <label className="input-label" style={{ marginBottom: '8px' }}>
              Experience Level
            </label>
            <select
              value={editing ? form.experience_level : user?.experience_level}
              onChange={(e) => setForm((f) => ({ ...f, experience_level: e.target.value }))}
              disabled={!editing}
              className="input"
              style={{ width: '100%', cursor: editing ? 'pointer' : 'default' }}
              id="profile-level"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l.toLowerCase()} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Daily Goal range */}
          <div>
            <label className="input-label" style={{ marginBottom: '8px' }}>
              Daily Practice Goal: {editing ? form.daily_goal_minutes : user?.daily_goal_minutes} minutes
            </label>
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={editing ? form.daily_goal_minutes : user?.daily_goal_minutes ?? 30}
              onChange={(e) => setForm((f) => ({ ...f, daily_goal_minutes: Number(e.target.value) }))}
              disabled={!editing}
              style={{
                width: '100%',
                cursor: editing ? 'pointer' : 'default',
                height: '6px',
                borderRadius: '3px',
                accentColor: 'var(--primary)',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>10 min</span>
              <span>120 min</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
