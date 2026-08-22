import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Zap, AlertCircle } from 'lucide-react'
import { Button, Input, Card } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { loginApi } from '../api/auth'

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-title"
    >
      <Card padding="lg" className="w-full max-w-sm shadow-lg">
        <h2 id="forgot-title" className="text-base font-semibold text-surface-900">
          Reset your password
        </h2>

        {sent ? (
          <>
            <p className="text-sm text-surface-500 mt-3 leading-relaxed">
              If an account exists for <strong>{email}</strong>, a reset link
              will be sent to that address shortly.
            </p>
            <Button variant="primary" size="md" fullWidth className="mt-5" onClick={onClose}>
              Back to Sign In
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-surface-500 mt-1 mb-4">
              Enter your email and we'll send you a reset link.
            </p>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              autoFocus
            />
            <div className="flex gap-2 mt-5">
              <Button variant="secondary" size="md" fullWidth onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                disabled={!email.includes('@')}
                onClick={() => setSent(true)}
              >
                Send Link
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPwd,     setShowPwd]     = useState(false)
  const [isLoading,   setIsLoading]   = useState(false)
  const [error,       setError]       = useState('')
  const [showForgot,  setShowForgot]  = useState(false)

  /* ── Validation ─────────────────────────────────────── */
  const emailError    = email.length > 0 && !email.includes('@') ? 'Enter a valid email address.' : ''
  const canSubmit     = email.includes('@') && password.length >= 6 && !isLoading

  /* ── Submit ─────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError('')
    setIsLoading(true)

    try {
      const res = await loginApi({ email, password })
      login(res.token, res.user)
      navigate('/')
    } catch (err: unknown) {
      setIsLoading(false)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Incorrect email or password. Please try again.')
      }
    }
  }

  return (
    <>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

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
            No account?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </header>

        {/* Form area */}
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <Card padding="xl" className="w-full max-w-sm shadow-sm">
            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-surface-900">Sign in</h1>
              <p className="text-sm text-surface-500 mt-1">
                Continue your career journey.
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
              {/* Email */}
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                error={emailError}
                fullWidth
                autoComplete="email"
                disabled={isLoading}
                required
              />

              {/* Password */}
              <Input
                label="Password"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                fullWidth
                autoComplete="current-password"
                disabled={isLoading}
                required
                hint={password.length > 0 && password.length < 6 ? 'At least 6 characters required.' : undefined}
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

              {/* Forgot password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                >
                  Forgot password?
                </button>
              </div>

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
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-surface-100" />
              <span className="text-xs text-surface-400">or</span>
              <div className="flex-1 h-px bg-surface-100" />
            </div>

            {/* Create account */}
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => navigate('/register')}
            >
              Create Account
            </Button>
          </Card>
        </main>
      </div>
    </>
  )
}
