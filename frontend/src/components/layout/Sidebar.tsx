import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Music, Play, BarChart3, Trophy,
  Wrench, MessageSquareText, User, LogOut, Flame, X, Compass
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard,   label: 'Dashboard' },
  { to: '/library',      icon: Music,             label: 'Music Library' },
  { to: '/practice',     icon: Play,              label: 'Practice' },
  { to: '/statistics',   icon: BarChart3,         label: 'Statistics' },
  { to: '/achievements', icon: Trophy,            label: 'Achievements' },
  { to: '/tools',        icon: Wrench,            label: 'Tools' },
  { to: '/coach',        icon: MessageSquareText, label: 'AI Coach' },
  { to: '/maqams',       icon: Compass,           label: 'Maqam World' },
]

interface Props { isOpen: boolean; onClose: () => void }

export default function Sidebar({ isOpen, onClose }: Props) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/auth/login') }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg,#D4A35F,#D97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
          }}>🎼</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
              Maestro AI
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Music Coach</div>
          </div>
        </div>
        <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', display: 'none' }}
          id="sidebar-close-btn">
          <X size={16} />
        </button>
      </div>

      <div className="divider" style={{ margin: '0 16px 12px' }} />

      {/* User card */}
      {user && (
        <div style={{ margin: '0 12px 16px', padding: '12px', borderRadius: '12px', background: 'rgba(212,163,95,0.05)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#D4A35F,#D97706)', color: '#0D0A08',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.875rem'
            }}>
              {user.full_name?.[0] ?? '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Lv.{user.current_level} · {user.instrument}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.total_xp.toLocaleString()} XP</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Flame size={10} /> {user.current_streak}d
              </span>
            </div>
            <div className="progress-bar" style={{ height: '3px' }}>
              <div className="progress-fill" style={{ width: `${(user.total_xp % 1000) / 10}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 10px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 6px', marginBottom: '6px' }}>
          Menu
        </div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={onClose}
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}>
            {({ isActive }) => (
              <>
                <Icon size={17} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '10px' }}>
        <div className="divider" style={{ marginBottom: '8px' }} />
        <NavLink to="/profile" onClick={onClose}
          className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}>
          {({ isActive }) => (
            <>
              <User size={17} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
              <span>Profile</span>
            </>
          )}
        </NavLink>
        <button onClick={handleLogout} className="sidebar-nav-item" style={{ color: 'var(--text-muted)' }}>
          <LogOut size={17} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
