import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  Zap,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'
import { Button, Card, Badge, Progress } from '../components/ui'
import { JourneyIndicator } from '../components/JourneyIndicator'
import { useAuth } from '../context/AuthContext'
import { runFullAnalysisApi, AnalysisResults } from '../api/analysis'

/* ══════════════════════════════════════════════════════════════
   Analysis state machine
══════════════════════════════════════════════════════════════ */
type AnalysisStatus = 'analyzing' | 'complete' | 'error'
type StepStatus     = 'pending'   | 'active'   | 'complete'

interface AnalysisStep {
  id:       number
  label:    string
  duration: number   // ms before this step completes
  progress: number   // overall % when this step finishes
}

const STEPS: AnalysisStep[] = [
  { id: 1, label: 'Reading your resume',           duration:  600, progress: 15 },
  { id: 2, label: 'Extracting technical skills',   duration:  700, progress: 30 },
  { id: 3, label: 'Reviewing your projects',       duration:  700, progress: 45 },
  { id: 4, label: 'Analyzing GitHub activity',     duration:  700, progress: 60 },
  { id: 5, label: 'Evaluating career fit',         duration:  800, progress: 75 },
  { id: 6, label: 'Identifying skill gaps',        duration:  700, progress: 88 },
  { id: 7, label: 'Building career recommendations', duration: 800, progress: 100 },
]

/* ══════════════════════════════════════════════════════════════
   Rotating insights
══════════════════════════════════════════════════════════════ */
const INSIGHTS = [
  'Evaluating resume skills and technical experience...',
  'Analyzing connected GitHub profile and repositories...',
  'Calculating career match percentages...',
  'Evaluating skill gaps and priorities...',
  'Building personalized learning roadmap...',
]

/* ══════════════════════════════════════════════════════════════
   Step row
══════════════════════════════════════════════════════════════ */
function StepRow({ label, status }: { label: string; status: StepStatus }) {
  return (
    <div className="flex items-center gap-3">
      {/* Status icon */}
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
        {status === 'complete' && (
          <CheckCircle2 size={18} className="text-success-500" />
        )}
        {status === 'active' && (
          <Loader2 size={18} className="text-brand-500 animate-spin" />
        )}
        {status === 'pending' && (
          <div className="w-4 h-4 rounded-full border-2 border-surface-200" />
        )}
      </div>

      {/* Connector line + label */}
      <span
        className={clsx(
          'text-sm transition-colors duration-300',
          status === 'complete' && 'text-surface-700 font-medium',
          status === 'active'   && 'text-brand-700 font-semibold',
          status === 'pending'  && 'text-surface-400'
        )}
      >
        {label}
      </span>

      {/* Active pulse badge */}
      {status === 'active' && (
        <span className="ml-auto">
          <span className="inline-flex items-center gap-1 text-xs text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full animate-pulse">
            Processing
          </span>
        </span>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Insight card (rotating)
══════════════════════════════════════════════════════════════ */
function InsightCard({ text }: { text: string }) {
  return (
    <div
      className={clsx(
        'flex items-start gap-2.5 px-4 py-3 rounded-xl',
        'bg-brand-50 border border-brand-100',
        'transition-all duration-500'
      )}
    >
      <Sparkles size={14} className="text-brand-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-brand-700">{text}</p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Shared page header (no sidebar)
══════════════════════════════════════════════════════════════ */
function AnalysisHeader() {
  return (
    <header className="flex items-center justify-between px-6 sm:px-10 h-16 bg-white border-b border-surface-100 flex-shrink-0">
      <Link to="/welcome" className="flex items-center gap-2 no-underline hover:no-underline">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-semibold text-surface-900 text-sm">Career Copilot</span>
      </Link>
      <Badge variant="primary" size="sm">AI Analysis</Badge>
    </header>
  )
}

/* ══════════════════════════════════════════════════════════════
   Complete state
══════════════════════════════════════════════════════════════ */
function CompleteView({
  results,
  onGoCareer,
  onReviewProfile,
}: {
  results: AnalysisResults | null
  onGoCareer: () => void
  onReviewProfile: () => void
}) {
  const topRec = results?.recommendations?.[0]
  const careerGoal = topRec?.career || sessionStorage.getItem('cc_careerGoal') || 'Software Developer'
  const matchScore = topRec?.matchPercentage || 90

  // Combine unique skills from recommendations and skill gaps
  const extractedSkills = Array.from(
    new Set([
      ...(topRec?.requiredSkills || []),
      ...(results?.skillGaps?.map((g) => g.skill) || []),
    ])
  )
  const skills = extractedSkills.length > 0 ? extractedSkills.slice(0, 6) : ['Java', 'Python', 'SQL', 'React', 'Git']

  const experience = sessionStorage.getItem('cc_experienceLevel') || 'Student / Beginner'

  return (
    <div className="space-y-6 w-full">
      {/* Hero */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-success-50 border-2 border-success-200 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={30} className="text-success-500" />
        </div>
        <h1 className="text-2xl font-bold text-surface-900">Your Career Profile is Ready 🚀</h1>
        <p className="text-sm text-surface-500 mt-2 max-w-sm mx-auto leading-relaxed">
          We analyzed your profile and identified your strongest career matches,
          skill gaps and next learning priorities.
        </p>
      </div>

      {/* Summary card */}
      <Card padding="lg" className="border-brand-100">
        {/* Top career match */}
        <div className="flex items-center justify-between mb-5 pb-5 border-b border-surface-100">
          <div>
            <p className="text-xs text-surface-500 font-medium mb-1">Top Career Match</p>
            <p className="text-xl font-bold text-surface-900">{careerGoal}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-3xl font-bold text-brand-600">{matchScore}%</span>
            <Badge variant="primary" size="sm">Match</Badge>
          </div>
        </div>

        {/* Progress bar for match */}
        <Progress
          value={matchScore}
          size="md"
          color="brand"
          className="mb-5"
        />

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Recommendations', value: String(results?.recommendations?.length || 1) },
            { label: 'Skill Gaps',       value: String(results?.skillGaps?.length || 0)        },
            { label: 'Experience',       value: experience                                    },
            { label: 'Roadmap Tasks',    value: String(results?.roadmap?.tasks?.length || 0)  },
          ].map((s) => (
            <div key={s.label} className="bg-surface-50 border border-surface-100 rounded-xl px-3 py-2.5 text-center">
              <p className="text-xs text-surface-400 mb-0.5">{s.label}</p>
              <p className="text-sm font-semibold text-surface-800 truncate">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Skills detected */}
        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">
            Key skills & focus areas
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="default" size="md">{skill}</Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          rightIcon={<ChevronRight size={17} />}
          onClick={onGoCareer}
        >
          View My Career Recommendations
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={onReviewProfile}
          className="sm:w-auto flex-shrink-0"
        >
          Review My Profile
        </Button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Error state
══════════════════════════════════════════════════════════════ */
function ErrorView({
  errorMessage,
  onRetry,
  onBack,
}: {
  errorMessage?: string
  onRetry: () => void
  onBack: () => void
}) {
  return (
    <div className="text-center space-y-5 w-full max-w-sm mx-auto">
      <div className="w-14 h-14 rounded-full bg-danger-50 border-2 border-danger-100 flex items-center justify-center mx-auto">
        <AlertTriangle size={24} className="text-danger-500" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-surface-900">Analysis couldn't be completed</h2>
        <p className="text-sm text-surface-500 mt-2 leading-relaxed">
          {errorMessage || 'Something went wrong while analyzing your profile.'}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button variant="primary"   size="lg" fullWidth onClick={onRetry}>
          Try Again
        </Button>
        <Button variant="secondary" size="md" fullWidth leftIcon={<ArrowLeft size={15} />} onClick={onBack}>
          Back to Profile
        </Button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main AnalysisPage
══════════════════════════════════════════════════════════════ */
export function AnalysisPage() {
  const navigate = useNavigate()
  const { token } = useAuth()

  const [status,           setStatus]       = useState<AnalysisStatus>('analyzing')
  const [activeStep,       setActiveStep]   = useState(0)          // 0 = none started
  const [completedSteps,    setCompleted]   = useState<number[]>([])
  const [progress,         setProgress]     = useState(0)
  const [insightIdx,       setInsightIdx]   = useState(0)
  const [analysisResults,  setResults]      = useState<AnalysisResults | null>(null)
  const [errorMessage,     setErrorMessage] = useState('')

  // Track whether the sequence is currently running (for restarts)
  const runningRef = useRef(false)
  const apiCompleteRef = useRef(false)

  /* ── Start / restart analysis ─────────────────────── */
  function startAnalysis() {
    setStatus('analyzing')
    setActiveStep(0)
    setCompleted([])
    setProgress(0)
    setInsightIdx(0)
    setResults(null)
    setErrorMessage('')
    runningRef.current = true
    apiCompleteRef.current = false

    // Launch real backend analysis APIs
    if (token) {
      runFullAnalysisApi(token)
        .then((res) => {
          if (!runningRef.current) return
          setResults(res)
          apiCompleteRef.current = true
        })
        .catch((err: unknown) => {
          if (!runningRef.current) return
          runningRef.current = false
          if (err instanceof Error) {
            setErrorMessage(err.message)
          } else {
            setErrorMessage('Analysis failed. Please ensure your resume and GitHub are connected.')
          }
          setStatus('error')
        })
    }

    runSteps(0, [])
  }

  function runSteps(stepIndex: number, done: number[]) {
    if (!runningRef.current) return
    if (stepIndex >= STEPS.length) return

    const step = STEPS[stepIndex]
    setActiveStep(step.id)

    setTimeout(() => {
      if (!runningRef.current) return

      const nowDone = [...done, step.id]
      setCompleted(nowDone)
      setProgress(step.progress)

      if (stepIndex + 1 < STEPS.length) {
        if (stepIndex % 2 === 1) {
          setInsightIdx((i) => (i + 1) % INSIGHTS.length)
        }
        runSteps(stepIndex + 1, nowDone)
      } else {
        // Visual steps complete
        setActiveStep(0)
        const checkFinish = setInterval(() => {
          if (!runningRef.current) {
            clearInterval(checkFinish)
            return
          }
          if (apiCompleteRef.current || !token) {
            clearInterval(checkFinish)
            setStatus('complete')
          }
        }, 200)
      }
    }, step.duration)
  }

  // Auto-start on mount
  useEffect(() => {
    startAnalysis()
    return () => { runningRef.current = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Step status helper ───────────────────────────── */
  function stepStatus(id: number): StepStatus {
    if (completedSteps.includes(id)) return 'complete'
    if (activeStep === id)           return 'active'
    return 'pending'
  }

  /* ── Handlers ─────────────────────────────────────── */
  function handleRetry() {
    runningRef.current = false
    setTimeout(() => startAnalysis(), 50)
  }

  /* ══════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <AnalysisHeader />

      <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg">

          {/* ── ERROR ──────────────────────────────────────── */}
          {status === 'error' && (
            <ErrorView
              errorMessage={errorMessage}
              onRetry={handleRetry}
              onBack={() => navigate('/profile-input')}
            />
          )}

          {/* ── ANALYZING ──────────────────────────────────── */}
          {status === 'analyzing' && (
            <div className="space-y-6">
              {/* Title */}
              <div className="text-center">
                {/* Icon with ring pulse */}
                <div className="relative w-16 h-16 mx-auto mb-5">
                  <div className="absolute inset-0 rounded-full bg-brand-100 animate-ping opacity-40" />
                  <div className="relative w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center">
                    <Zap size={26} className="text-white" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-surface-900">
                  Analyzing Your Career Profile
                </h1>
                <p className="text-sm text-surface-500 mt-2 max-w-sm mx-auto leading-relaxed">
                  Career Copilot is reviewing your skills, projects, experience
                  and interests to build your personalized career plan.
                </p>
              </div>

              {/* Overall progress */}
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs text-surface-500">
                  <span>Analyzing…</span>
                  <span className="font-semibold text-brand-600">{progress}%</span>
                </div>
                <Progress
                  value={progress}
                  size="md"
                  color="brand"
                  animated
                />
              </div>

              {/* Rotating insight card */}
              <InsightCard text={INSIGHTS[insightIdx]} />

              {/* Steps timeline */}
              <Card padding="lg">
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-4">
                  Analysis Steps
                </p>
                <div className="space-y-3.5">
                  {STEPS.map((step, i) => (
                    <div key={step.id}>
                      <StepRow label={step.label} status={stepStatus(step.id)} />
                      {/* Connector line */}
                      {i < STEPS.length - 1 && (
                        <div className="ml-3 mt-1 mb-0.5 w-px h-3 bg-surface-100" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Dev escape hatch — trigger error for testing */}
              <button
                type="button"
                onClick={() => { runningRef.current = false; setStatus('error') }}
                className="block mx-auto text-xs text-surface-300 hover:text-surface-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-400 rounded"
                aria-label="Simulate analysis error (dev only)"
              >
                Simulate error ↗
              </button>
            </div>
          )}

          {/* ── COMPLETE ───────────────────────────────────── */}
          {status === 'complete' && (
            <CompleteView
              results={analysisResults}
              onGoCareer={() => navigate('/career')}
              onReviewProfile={() => navigate('/profile-input')}
            />
          )}
        </div>

        {/* Journey indicator */}
        <div className="w-full max-w-lg mt-10 pt-6 border-t border-surface-100">
          <p className="text-xs text-surface-400 mb-2 font-medium">Your career journey</p>
          <JourneyIndicator activeStep={2} />
        </div>
      </main>
    </div>
  )
}
