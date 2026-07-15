import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers, underscores only'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  instrument: z.enum(['violin', 'piano', 'guitar', 'voice']),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced', 'professional']),
})

type FormData = z.infer<typeof schema>

const INSTRUMENTS = [
  { value: 'violin', label: '🎻 Violin' },
  { value: 'piano', label: '🎹 Piano' },
  { value: 'guitar', label: '🎸 Guitar' },
  { value: 'voice', label: '🎤 Voice' },
]

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'professional', label: 'Professional' },
]

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false)
  const [serverError, setServerError] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { instrument: 'piano', experience_level: 'beginner' },
  })

  const selectedInstrument = watch('instrument')

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      const res = await api.post('/api/v1/auth/register', data)
      setAuth(res.data.user, res.data.access_token, res.data.refresh_token)
      navigate('/dashboard')
    } catch (err: any) {
      setServerError(err.response?.data?.detail || 'Registration failed. Please try again.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h2 className="heading-lg mb-2" style={{ color: 'var(--text-primary)' }}>Start your journey</h2>
      <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Join thousands of musicians improving with AI
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label">Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input {...register('full_name')} placeholder="Mozart Jr." className="input pl-9" id="reg-name" />
            </div>
            {errors.full_name && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="input-label">Username</label>
            <input {...register('username')} placeholder="mozart_jr" className="input" id="reg-username" />
            {errors.username && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{errors.username.message}</p>}
          </div>
        </div>

        <div>
          <label className="input-label">Email</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input {...register('email')} type="email" placeholder="you@example.com" className="input pl-9" id="reg-email" />
          </div>
          {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{errors.email.message}</p>}
        </div>

        <div>
          <label className="input-label">Password</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input {...register('password')} type={showPass ? 'text' : 'password'}
              placeholder="Minimum 8 characters" className="input pl-9 pr-10" id="reg-password" />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-0">
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{errors.password.message}</p>}
        </div>

        {/* Instrument picker */}
        <div>
          <label className="input-label">Your Instrument</label>
          <div className="grid grid-cols-4 gap-2">
            {INSTRUMENTS.map(({ value, label }) => (
              <label key={value} className="cursor-pointer">
                <input {...register('instrument')} type="radio" value={value} className="sr-only" />
                <div className={`p-2 rounded-xl text-center text-sm transition-all ${
                  selectedInstrument === value
                    ? 'border-2 font-semibold'
                    : 'border cursor-pointer'
                }`}
                  style={{
                    borderColor: selectedInstrument === value ? 'var(--primary)' : 'var(--border)',
                    background: selectedInstrument === value ? 'rgba(212,163,95,0.1)' : 'var(--bg-surface)',
                    color: selectedInstrument === value ? 'var(--primary)' : 'var(--text-secondary)',
                  }}>
                  {label}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Level */}
        <div>
          <label className="input-label">Experience Level</label>
          <select {...register('experience_level')} className="input" id="reg-level">
            {LEVELS.map(({ value, label }) => (
              <option key={value} value={value} style={{ background: 'var(--bg-card)' }}>{label}</option>
            ))}
          </select>
        </div>

        {serverError && (
          <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {serverError}
          </div>
        )}

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={isSubmitting} id="reg-submit">
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-sm text-center mt-5" style={{ color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <Link to="/auth/login" style={{ color: 'var(--primary)' }} className="font-semibold">Sign in</Link>
      </p>
    </motion.div>
  )
}
