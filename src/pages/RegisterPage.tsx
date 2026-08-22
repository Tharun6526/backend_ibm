import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Zap, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button, Input, Card } from '../components/ui'
import { clsx } from 'clsx'
import { useAuth } from '../context/AuthContext'
import { registerApi } from '../api/auth'

/* ── Password strength ──────────────────────────────────────── */
function getStrength(pwd: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (pwd.length === 0) return { level: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8)               score++
  if (/[A-Z]/.test(pwd))             score++
  if (/[0-9]/.test(pwd))             score++
  if (/[^A-Za-z0-9]/.test(pwd))      score++

  if (score <= 1) return { level: 1, label: 'Weak',   color: 'bg-danger-500' }
  if (score === 2) return { level: 2, label: 'Fair',   color: 'bg-warning-500' }
  return               { level: 3, label: 'Strong', color: 'bg-success-500' }
}

function StrengthBar({ password }: { password: string }) {
  const { level, label, color } = getStrength(password)
  if (password.length === 0) return null

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={clsx(
              'h-1 flex-1 rounded-full transition-all duration-300',
              level >= i ? color : 'bg-surface-200'
            )}
          />
        ))}
      </div>
      <p className={clsx(
        'text-xs font-medium',
        level === 1 && 'text-danger-600',
        level === 2 && 'text-warning-600',
        level === 3 && 'text-success-600',
      )}>
        {label} password
      </p>
    </div>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [fullName,        setFullName]        = useState('')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd,         setShowPwd]         = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [isLoading,       setIsLoading]       = useState(false)
  const [error,           setError]           = useState('')
  const [success,         setSuccess]         = useState(false)

  /* ── Field-level errors (only shown after user has touched) ── */
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  const mark = (field: keyof typeof touched) =>
    setTouched((t) => ({ ...t, [field]: true }))

  const nameError     = touched.fullName        && fullName.trim().length < 2      ? 'Full name is required.'              : ''
  const emailError    = touched.email           && !email.includes('@')            ? 'Enter a valid email address.'        : ''
  const passwordError = touched.password        && password.length < 8            ? 'Password must be at least 8 characters.' : ''
  const confirmError  = touched.confirmPassword && password !== confirmPassword    ? 'Passwords do not match.'             : ''

  const strength = getStrength(password)

  const canSubmit =
    fullName.trim().length >= 2 &&
    email.includes('@') &&
    password.length >= 8 &&
    strength.level >= 1 &&
    password === confirmPassword &&
    !isLoading

  /* ── Submit ─────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Mark all touched to surface any remaining errors
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true })
    if (!canSubmit) return
    setError('')
    setIsLoading(true)

    try {
      const res = await registerApi({ name: fullName, email, password })
      login(res.token, res.user)
      setIsLoading(false)
      setSuccess(true)
      setTimeout(() => navigate('/onboarding'), 1200)
    } catch (err: unknown) {
      setIsLoading(false)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Registration failed. Please try again.')
      }
    }
  }

  /* ── Success state ───────────────────────────────────── */
  if (success) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <Card padding="xl" className="w-full max-w-sm text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={24} className="text-success-600" />
          </div>
          <h2 className="text-lg font-bold text-surface-900">Account created!</h2>
          <p className="text-sm text-surface-500 mt-2">
            Setting up your career profile…
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 sm:px-10 h-16 bg-white border-b border-surface-100 flex-shrink-0">
        <Link to="/welcome" className="flex items-center gap-2 no-underline hover:no-underline">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-semibold text-surface-900 text-sm">Career Copilot</span>
        </Link>
        <p className="text-sm text-surface-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </header>

      {/* Form area */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card padding="xl" className="w-full max-w-sm shadow-sm">
          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-surface-900">Create your account</h1>
            <p className="text-sm text-surface-500 mt-1">
              Start your AI-powered career journey.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 bg-danger-50 border border-danger-100 text-danger-700 text-sm px-4 py-3 rounded-lg mb-5">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full name */}
            <Input
              label="Full name"
              type="text"
              placeholder="Alex Johnson"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setError('') }}
              onBlur={() => mark('fullName')}
              error={nameError}
              fullWidth
              autoComplete="name"
              disabled={isLoading}
              required
            />

            {/* Email */}
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              onBlur={() => mark('email')}
              error={emailError}
              fullWidth
              autoComplete="email"
              disabled={isLoading}
              required
            />

            {/* Password */}
            <div>
              <Input
                label="Password"
                type={showPwd ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                onBlur={() => mark('password')}
                error={passwordError}
                fullWidth
                autoComplete="new-password"
                disabled={isLoading}
                required
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="text-surface-400 hover:text-surface-600 transition-colors focus:outline-none"
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
              <StrengthBar password={password} />
            </div>

            {/* Confirm password */}
            <Input
              label="Confirm password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
              onBlur={() => mark('confirmPassword')}
              error={confirmError}
              fullWidth
              autoComplete="new-password"
              disabled={isLoading}
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="text-surface-400 hover:text-surface-600 transition-colors focus:outline-none"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={!canSubmit}
              className="mt-2"
            >
              Create Account
            </Button>
          </form>

          <p className="text-xs text-surface-400 text-center mt-4 leading-relaxed">
            By creating an account you agree to our{' '}
            <span className="text-brand-600 cursor-pointer hover:underline">Terms</span>
            {' '}and{' '}
            <span className="text-brand-600 cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </Card>
      </main>
    </div>
  )
}
