import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { Zap, ChevronRight, ArrowLeft, Rocket, AlertCircle } from 'lucide-react'
import { Button, Card, Badge, Progress } from '../components/ui'
import { Input } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { getProfileApi, updateProfileApi } from '../api/profile'

/* ══════════════════════════════════════════════════════════════
   Mock user data shape — easy to replace with backend later
══════════════════════════════════════════════════════════════ */
export interface MockUser {
  name: string
  degree: string
  branch: string
  graduationYear: string
  careerGoal: string
  experienceLevel: string
  interests: string[]
  weeklyHours: string
  learningStyle: string
  experienceForLearning: string
}

const DEFAULT_USER: MockUser = {
  name: '',
  degree: '',
  branch: '',
  graduationYear: '',
  careerGoal: '',
  experienceLevel: '',
  interests: [],
  weeklyHours: '',
  learningStyle: '',
  experienceForLearning: '',
}

function mapToExperienceEnum(label: string): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
  if (label.includes('3+') || label.toLowerCase().includes('advanced')) return 'ADVANCED'
  if (label.includes('1–2') || label.includes('Internship') || label.toLowerCase().includes('intermediate')) return 'INTERMEDIATE'
  return 'BEGINNER'
}

function mapFromExperienceEnum(enumVal?: string): string {
  if (enumVal === 'ADVANCED') return '3+ Years Experience'
  if (enumVal === 'INTERMEDIATE') return '1–2 Years Experience'
  return 'Student / Beginner'
}

function mapToHoursPerDay(weeklyHoursStr: string): number {
  if (weeklyHoursStr.includes('15+')) return 4
  if (weeklyHoursStr.includes('10–15')) return 3
  if (weeklyHoursStr.includes('5–10')) return 2
  return 1
}

function mapFromHoursPerDay(hours?: number): string {
  if (!hours || hours <= 1) return '2–5 hours'
  if (hours === 2) return '5–10 hours'
  if (hours === 3) return '10–15 hours'
  return '15+ hours'
}

/* ══════════════════════════════════════════════════════════════
   Step 1 data
══════════════════════════════════════════════════════════════ */
const CAREER_GOALS = [
  'Software Developer',
  'Backend Developer',
  'Frontend Developer',
  'Data Analyst',
  'Data Scientist',
  'ML Engineer',
  'Cloud Engineer',
  'DevOps Engineer',
  'Cybersecurity Engineer',
  'UI/UX Designer',
  'Not Sure Yet',
]

/* ══════════════════════════════════════════════════════════════
   Step 2 data
══════════════════════════════════════════════════════════════ */
const EXPERIENCE_LEVELS = [
  { id: 'student',   label: 'Student / Beginner',    description: 'Learning the fundamentals' },
  { id: 'projects',  label: 'Some Projects',          description: 'Built personal or academic projects' },
  { id: 'intern',    label: 'Internship Experience',  description: 'Completed one or more internships' },
  { id: '1-2yrs',    label: '1–2 Years Experience',   description: 'Early career professional' },
  { id: '3plus',     label: '3+ Years Experience',    description: 'Mid-to-senior professional' },
]

/* ══════════════════════════════════════════════════════════════
   Step 3 data
══════════════════════════════════════════════════════════════ */
const INTERESTS = [
  'AI / ML',
  'Web Development',
  'Backend',
  'Cloud',
  'Data',
  'Cybersecurity',
  'Mobile',
  'DevOps',
  'Databases',
  'UI/UX',
  'Open Source',
]

/* ══════════════════════════════════════════════════════════════
   Step 4 data
══════════════════════════════════════════════════════════════ */
const WEEKLY_HOURS    = ['2–5 hours', '5–10 hours', '10–15 hours', '15+ hours']
const LEARNING_STYLES = ['Video', 'Hands-on Projects', 'Reading', 'Practice Problems', 'Mixed']
const EXP_LEVELS      = ['Beginner', 'Intermediate', 'Advanced']

/* ══════════════════════════════════════════════════════════════
   Small helpers
══════════════════════════════════════════════════════════════ */
interface SelectionChipProps {
  label: string
  selected: boolean
  onClick: () => void
  size?: 'sm' | 'md'
}

function SelectionChip({ label, selected, onClick, size = 'md' }: SelectionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 rounded-xl border text-left transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        size === 'sm' ? 'px-3.5 py-2 text-sm' : 'px-4 py-2.5 text-sm',
        selected
          ? 'border-brand-400 bg-brand-50 text-brand-700 font-medium'
          : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300 hover:bg-surface-50'
      )}
      aria-pressed={selected}
    >
      <span
        className={clsx(
          'w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors',
          selected ? 'border-brand-500 bg-brand-500' : 'border-surface-300'
        )}
      >
        {selected && (
          <svg viewBox="0 0 8 8" className="w-2.5 h-2.5" fill="white">
            <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        )}
      </span>
      {label}
    </button>
  )
}

interface MultiChipProps {
  label: string
  selected: boolean
  onClick: () => void
}

function MultiChip({ label, selected, onClick }: MultiChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'px-4 py-2 rounded-full border text-sm transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        selected
          ? 'border-brand-400 bg-brand-50 text-brand-700 font-medium'
          : 'border-surface-200 bg-white text-surface-600 hover:border-surface-300 hover:bg-surface-50'
      )}
      aria-pressed={selected}
    >
      {selected && <span className="mr-1.5">✓</span>}
      {label}
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main OnboardingPage
══════════════════════════════════════════════════════════════ */
export function OnboardingPage() {
  const navigate = useNavigate()
  const { token } = useAuth()

  const [step, setStep]           = useState(1)
  const [user, setUser]           = useState<MockUser>(DEFAULT_USER)
  const [done, setDone]           = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]         = useState('')

  const TOTAL_STEPS = 4

  /* ── Restore profile on mount ─────────────────────────── */
  useEffect(() => {
    if (!token) return
    let isMounted = true
    getProfileApi(token)
      .then((data) => {
        if (!isMounted || !data) return
        setUser((prev) => ({
          ...prev,
          name: data.user?.name || prev.name,
          degree: data.degree || prev.degree,
          branch: data.branch || prev.branch,
          graduationYear: data.graduationYear ? String(data.graduationYear) : prev.graduationYear,
          careerGoal: data.careerGoal || prev.careerGoal,
          experienceLevel: data.experienceLevel ? mapFromExperienceEnum(data.experienceLevel) : prev.experienceLevel,
          weeklyHours: data.hoursPerDay ? mapFromHoursPerDay(data.hoursPerDay) : prev.weeklyHours,
          learningStyle: data.preferredLearningStyle || prev.learningStyle,
        }))
      })
      .catch(() => {
        // Silently catch if profile doesn't exist yet
      })
    return () => {
      isMounted = false
    }
  }, [token])

  /* ── Validation per step ─────────────────────────────── */
  const step1Valid = user.careerGoal !== ''
  const step2Valid =
    user.experienceLevel !== '' &&
    user.degree.trim().length > 0 &&
    user.branch.trim().length > 0 &&
    user.graduationYear.trim().length > 0
  const step3Valid = user.interests.length > 0
  const step4Valid =
    user.weeklyHours !== '' &&
    user.learningStyle !== '' &&
    user.experienceForLearning !== ''

  const canContinue =
    step === 1 ? step1Valid :
    step === 2 ? step2Valid :
    step === 3 ? step3Valid :
    step4Valid && !isSubmitting

  /* ── Mutators ────────────────────────────────────────── */
  function toggleInterest(interest: string) {
    setUser((u) => ({
      ...u,
      interests: u.interests.includes(interest)
        ? u.interests.filter((i) => i !== interest)
        : [...u.interests, interest],
    }))
  }

  async function handleContinue() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
      return
    }

    if (!canContinue || isSubmitting) return

    setError('')
    setIsSubmitting(true)

    try {
      sessionStorage.setItem('cc_careerGoal', user.careerGoal)
      sessionStorage.setItem('cc_experienceLevel', user.experienceLevel)
      sessionStorage.setItem('cc_interests', JSON.stringify(user.interests))

      if (token) {
        await updateProfileApi(token, {
          degree: user.degree,
          branch: user.branch,
          graduationYear: parseInt(user.graduationYear, 10) || 2025,
          careerGoal: user.careerGoal,
          experienceLevel: mapToExperienceEnum(user.experienceLevel),
          hoursPerDay: mapToHoursPerDay(user.weeklyHours),
          preferredLearningStyle: user.learningStyle,
          targetMonths: 6,
        })
      }

      setIsSubmitting(false)
      setDone(true)
    } catch (err: unknown) {
      setIsSubmitting(false)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to save profile. Please try again.')
      }
    }
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1)
  }

  const stepProgress = (step / TOTAL_STEPS) * 100

  /* ─────────────────────────────────────────────────────
     DONE state — Profile ready
  ──────────────────────────────────────────────────────── */
  if (done) {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col">
        <OnboardingHeader />
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg">
            <Card padding="xl" className="shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-brand-50 border-2 border-brand-200 flex items-center justify-center mx-auto mb-5">
                <Rocket size={26} className="text-brand-600" />
              </div>
              <h2 className="text-2xl font-bold text-surface-900">
                Your career profile is ready 🚀
              </h2>
              <p className="text-sm text-surface-500 mt-2 mb-8 leading-relaxed">
                Next, add your resume and GitHub profile so we can
                analyze your skills and experience.
              </p>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 text-left mb-8">
                <SummaryItem label="Career Goal" value={user.careerGoal} />
                <SummaryItem label="Experience"  value={user.experienceLevel} />
                <SummaryItem
                  label="Interests"
                  value={
                    user.interests.length > 2
                      ? `${user.interests.slice(0, 2).join(', ')} +${user.interests.length - 2} more`
                      : user.interests.join(', ')
                  }
                />
                <SummaryItem
                  label="Learning Style"
                  value={`${user.learningStyle} · ${user.weeklyHours}`}
                />
              </div>

              {/* CTA */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                rightIcon={<ChevronRight size={17} />}
                onClick={() => navigate('/profile-input')}
              >
                Continue to Resume & GitHub
              </Button>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  /* ─────────────────────────────────────────────────────
     STEP layout
  ──────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <OnboardingHeader />

      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12">
        {/* Progress bar + step label */}
        <div className="w-full max-w-lg mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-widest">
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="text-xs text-surface-400">{Math.round(stepProgress)}%</span>
          </div>
          <Progress value={stepProgress} size="sm" color="brand" />

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={clsx(
                  'rounded-full transition-all duration-300',
                  i + 1 === step
                    ? 'w-5 h-2 bg-brand-500'
                    : i + 1 < step
                    ? 'w-2 h-2 bg-brand-300'
                    : 'w-2 h-2 bg-surface-200'
                )}
              />
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="w-full max-w-lg mb-6 flex items-start gap-2.5 bg-danger-50 border border-danger-100 text-danger-700 text-sm px-4 py-3 rounded-lg">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Step content card */}
        <div className="w-full max-w-lg">
          {step === 1 && <Step1 user={user} setUser={setUser} />}
          {step === 2 && <Step2 user={user} setUser={setUser} />}
          {step === 3 && <Step3 user={user} toggleInterest={toggleInterest} />}
          {step === 4 && <Step4 user={user} setUser={setUser} />}
        </div>

        {/* Navigation */}
        <div className="w-full max-w-lg mt-6 flex items-center gap-3">
          {step > 1 ? (
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<ArrowLeft size={16} />}
              onClick={handleBack}
              disabled={isSubmitting}
              className="w-28 flex-shrink-0"
            >
              Back
            </Button>
          ) : (
            <div className="w-28 flex-shrink-0" />
          )}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canContinue}
            isLoading={isSubmitting}
            rightIcon={<ChevronRight size={17} />}
            onClick={handleContinue}
          >
            {step === TOTAL_STEPS ? 'Finish Setup' : 'Continue'}
          </Button>
        </div>

        {/* Skip link — first step only */}
        {step === 1 && (
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-xs text-surface-400 hover:text-surface-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
          >
            Skip for now
          </button>
        )}
      </main>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Shared header (no sidebar, no navbar)
══════════════════════════════════════════════════════════════ */
function OnboardingHeader() {
  return (
    <header className="flex items-center justify-between px-6 sm:px-10 h-16 bg-white border-b border-surface-100 flex-shrink-0">
      <Link to="/welcome" className="flex items-center gap-2 no-underline hover:no-underline">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-semibold text-surface-900 text-sm">Career Copilot</span>
      </Link>
      <Badge variant="default" size="sm">Career Setup</Badge>
    </header>
  )
}

/* ── Summary item (used in done state) ─────────────────────── */
function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-50 border border-surface-100 rounded-xl px-4 py-3">
      <p className="text-xs text-surface-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-surface-800 truncate">{value || '—'}</p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   STEP 1 — Career Goal
══════════════════════════════════════════════════════════════ */
function Step1({
  user,
  setUser,
}: {
  user: MockUser
  setUser: React.Dispatch<React.SetStateAction<MockUser>>
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900">What career are you aiming for?</h2>
      <p className="text-sm text-surface-500 mt-1.5 mb-6 leading-relaxed">
        Choose the role that best matches where you want your career to go.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {CAREER_GOALS.map((goal) => (
          <SelectionChip
            key={goal}
            label={goal}
            selected={user.careerGoal === goal}
            onClick={() => setUser((u) => ({ ...u, careerGoal: goal }))}
          />
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   STEP 2 — Experience
══════════════════════════════════════════════════════════════ */
function Step2({
  user,
  setUser,
}: {
  user: MockUser
  setUser: React.Dispatch<React.SetStateAction<MockUser>>
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900">Tell us about your current experience</h2>
      <p className="text-sm text-surface-500 mt-1.5 mb-6 leading-relaxed">
        This helps us understand where you are starting from.
      </p>

      {/* Experience level */}
      <div className="space-y-2 mb-6">
        {EXPERIENCE_LEVELS.map((lvl) => (
          <button
            key={lvl.id}
            type="button"
            onClick={() => setUser((u) => ({ ...u, experienceLevel: lvl.label }))}
            className={clsx(
              'w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              user.experienceLevel === lvl.label
                ? 'border-brand-400 bg-brand-50'
                : 'border-surface-200 bg-white hover:border-surface-300 hover:bg-surface-50'
            )}
            aria-pressed={user.experienceLevel === lvl.label}
          >
            <span
              className={clsx(
                'w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors mt-0.5',
                user.experienceLevel === lvl.label
                  ? 'border-brand-500 bg-brand-500'
                  : 'border-surface-300'
              )}
            >
              {user.experienceLevel === lvl.label && (
                <svg viewBox="0 0 8 8" className="w-2.5 h-2.5" fill="white">
                  <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              )}
            </span>
            <div>
              <p className={clsx(
                'text-sm font-medium',
                user.experienceLevel === lvl.label ? 'text-brand-700' : 'text-surface-800'
              )}>
                {lvl.label}
              </p>
              <p className="text-xs text-surface-500 mt-0.5">{lvl.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Education fields */}
      <div className="space-y-3">
        <Input
          label="Current Degree"
          placeholder="e.g. Bachelor of Science, Associate Degree"
          value={user.degree}
          onChange={(e) => setUser((u) => ({ ...u, degree: e.target.value }))}
          fullWidth
          required
        />
        <Input
          label="Branch / Major"
          placeholder="e.g. Computer Science, Information Technology"
          value={user.branch}
          onChange={(e) => setUser((u) => ({ ...u, branch: e.target.value }))}
          fullWidth
          required
        />
        <Input
          label="Graduation Year"
          placeholder="e.g. 2025"
          value={user.graduationYear}
          onChange={(e) => setUser((u) => ({ ...u, graduationYear: e.target.value }))}
          fullWidth
          required
          type="number"
          min="2000"
          max="2035"
        />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   STEP 3 — Interests (multi-select)
══════════════════════════════════════════════════════════════ */
function Step3({
  user,
  toggleInterest,
}: {
  user: MockUser
  toggleInterest: (i: string) => void
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900">What do you enjoy working with?</h2>
      <p className="text-sm text-surface-500 mt-1.5 mb-2 leading-relaxed">
        Select the areas you would like to explore or improve.
      </p>

      {/* Selected count */}
      <div className="mb-5">
        {user.interests.length > 0 ? (
          <Badge variant="primary" dot size="md">
            {user.interests.length} {user.interests.length === 1 ? 'interest' : 'interests'} selected
          </Badge>
        ) : (
          <Badge variant="default" size="md">Select at least one</Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5">
        {INTERESTS.map((interest) => (
          <MultiChip
            key={interest}
            label={interest}
            selected={user.interests.includes(interest)}
            onClick={() => toggleInterest(interest)}
          />
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   STEP 4 — Learning Preferences
══════════════════════════════════════════════════════════════ */
function Step4({
  user,
  setUser,
}: {
  user: MockUser
  setUser: React.Dispatch<React.SetStateAction<MockUser>>
}) {
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-bold text-surface-900">How do you want to build your skills?</h2>
        <p className="text-sm text-surface-500 mt-1.5 leading-relaxed">
          We'll personalize your learning path based on your preferences.
        </p>
      </div>

      {/* Weekly learning time */}
      <div>
        <p className="text-sm font-semibold text-surface-700 mb-3">Weekly learning time</p>
        <div className="grid grid-cols-2 gap-2">
          {WEEKLY_HOURS.map((h) => (
            <SelectionChip
              key={h}
              label={h}
              selected={user.weeklyHours === h}
              onClick={() => setUser((u) => ({ ...u, weeklyHours: h }))}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Learning style */}
      <div>
        <p className="text-sm font-semibold text-surface-700 mb-3">Learning style</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LEARNING_STYLES.map((style) => (
            <SelectionChip
              key={style}
              label={style}
              selected={user.learningStyle === style}
              onClick={() => setUser((u) => ({ ...u, learningStyle: style }))}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Experience level */}
      <div>
        <p className="text-sm font-semibold text-surface-700 mb-3">Experience level</p>
        <div className="grid grid-cols-3 gap-2">
          {EXP_LEVELS.map((lvl) => (
            <SelectionChip
              key={lvl}
              label={lvl}
              selected={user.experienceForLearning === lvl}
              onClick={() => setUser((u) => ({ ...u, experienceForLearning: lvl }))}
              size="sm"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
