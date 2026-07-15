import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const [serverError, setServerError] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      const res = await api.post('/api/v1/auth/login', data)
      setAuth(res.data.user, res.data.access_token, res.data.refresh_token)
      navigate('/dashboard')
    } catch (err: any) {
      setServerError(err.response?.data?.detail || 'Login failed. Check your credentials.')
    }
  }

  // Demo login helper
  const demoLogin = async () => {
    setServerError('')
    try {
      const res = await api.post('/api/v1/auth/login', {
        email: 'demo@maestro.ai',
        password: 'demo123',
      })
      setAuth(res.data.user, res.data.access_token, res.data.refresh_token)
      navigate('/dashboard')
    } catch {
      // Populate form with demo creds if server not running
      const fakeUser = {
        id: 'demo-1', email: 'demo@maestro.ai', username: 'demo_pianist',
        full_name: 'Demo Musician', instrument: 'piano', experience_level: 'intermediate',
        total_xp: 2450, current_level: 5, current_streak: 12, longest_streak: 21,
        total_practice_minutes: 1820, pieces_mastered: 7, average_accuracy: 84.3,
        daily_goal_minutes: 45, is_teacher: false,
      }
      setAuth(fakeUser, 'demo-token', 'demo-refresh')
      navigate('/dashboard')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h2 className="heading-lg mb-2" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
      <p className="mb-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Sign in to continue your musical journey
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="input-label">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }} />
            <input {...register('email')} type="email" placeholder="you@example.com"
              className="input pl-9" id="login-email" />
          </div>
          {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="input-label" style={{ marginBottom: 0 }}>Password</label>
            <Link to="/auth/forgot" className="text-xs" style={{ color: 'var(--primary)' }}>
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }} />
            <input {...register('password')} type={showPass ? 'text' : 'password'}
              placeholder="••••••••" className="input pl-9 pr-10" id="login-password" />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-0">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{errors.password.message}</p>}
        </div>

        {serverError && (
          <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {serverError}
          </div>
        )}

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={isSubmitting} id="login-submit">
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {/* Demo login */}
      <button onClick={demoLogin} className="btn-secondary w-full mb-4 flex items-center justify-center gap-2"
        id="demo-login">
        🎹 Try Demo Account
      </button>

      <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
        Don't have an account?{' '}
        <Link to="/auth/register" style={{ color: 'var(--primary)' }} className="font-semibold">
          Sign up free
        </Link>
      </p>
    </motion.div>
  )
}
