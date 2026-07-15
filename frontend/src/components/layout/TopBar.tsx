import { useState, useEffect, useRef } from 'react'
import { Menu, Bell, Search, Zap, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

interface Props { onMenuClick: () => void }

export default function TopBar({ onMenuClick }: Props) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get('/api/v1/notifications/')
      .then(res => {
        setUnreadCount(res.data.unread_count || 0)
        setNotifications(res.data.notifications || [])
      })
      .catch(() => {})
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    try {
      await api.patch('/api/v1/notifications/read-all')
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch {}
  }

  const getNotifIcon = (type: string) => {
    if (type === 'achievement') return '🏆'
    if (type === 'reminder') return '⏰'
    if (type === 'ai_tip') return '🎵'
    return '📢'
  }

  return (
    <header className="topbar">
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        <button onClick={onMenuClick} className="btn-ghost"
          style={{ padding: '8px', display: 'none' }} id="mobile-menu-btn">
          <Menu size={20} />
        </button>
        <div style={{ position: 'relative', maxWidth: '280px', flex: 1 }}>
          <Search size={13} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search pieces, composers..."
            className="input"
            style={{ paddingLeft: '32px', paddingTop: '7px', paddingBottom: '7px', fontSize: '0.83rem' }}
            onFocus={() => navigate('/library')}
            readOnly
          />
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button onClick={() => navigate('/practice')} className="btn-primary"
          style={{ padding: '7px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Zap size={13} /> Quick Practice
        </button>

        {/* Notification bell with dropdown */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="btn-ghost"
            style={{ position: 'relative', padding: '8px' }}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '6px', right: '6px',
                minWidth: '14px', height: '14px', borderRadius: '7px',
                background: 'var(--error)', color: '#fff',
                fontSize: '0.58rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', right: 0, top: '42px', zIndex: 200,
              width: '320px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: '14px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Notifications {unreadCount > 0 && <span style={{ color: 'var(--primary)' }}>({unreadCount})</span>}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setShowNotifs(false)} className="btn-ghost" style={{ padding: '3px' }}>
                    <X size={13} />
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(212,163,95,0.06)',
                      background: n.is_read ? 'transparent' : 'rgba(212,163,95,0.04)',
                      display: 'flex', gap: '10px', alignItems: 'flex-start',
                      cursor: 'pointer'
                    }}>
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{getNotifIcon(n.type)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.35 }}>{n.message}</div>
                      </div>
                      {!n.is_read && (
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '4px' }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <button onClick={() => navigate('/profile')} style={{
          width: '33px', height: '33px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#D4A35F,#D97706)', color: '#0D0A08',
          fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {user?.full_name?.[0] ?? '?'}
        </button>
      </div>
    </header>
  )
}
