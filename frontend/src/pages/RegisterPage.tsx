import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { authApi } from '../api'
import { useAuthStore } from '../store/authStore'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

function passwordStrength(pw: string): { level: number; label: string; color: string } {
  if (pw.length === 0) return { level: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const map = [
    { level: 1, label: 'Weak', color: 'bg-red-500' },
    { level: 2, label: 'Fair', color: 'bg-yellow-500' },
    { level: 3, label: 'Good', color: 'bg-blue-500' },
    { level: 4, label: 'Strong', color: 'bg-green-500' },
  ]
  return map[score - 1] ?? map[0]
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const strength = passwordStrength(form.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await authApi.register(form)
      setAuth(data.user, data.accessToken, data.refreshToken)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Create account</h1>
          <p className="text-gray-400 text-sm mt-1">Join CollabHub today</p>
        </div>

        {/* Form card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Username"
                placeholder="johndoe"
                value={form.username}
                onChange={set('username')}
                autoComplete="username"
                required
              />
              <Input
                label="Display name"
                placeholder="John Doe"
                value={form.displayName}
                onChange={set('displayName')}
                autoComplete="name"
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
              required
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.level ? strength.color : 'bg-gray-700'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{strength.label}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full justify-center mt-2">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
