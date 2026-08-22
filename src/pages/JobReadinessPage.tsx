import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { Card, Badge, Button, Progress } from '../components/ui'
import { JourneyIndicator } from '../components/JourneyIndicator'
import { useAuth } from '../context/AuthContext'
import {
  getReadinessApi,
  calculateReadinessApi,
  type BackendReadinessResponse
} from '../api/readiness'

/* ══════════════════════════════════════════════════════════════
   Types & Helpers
══════════════════════════════════════════════════════════════ */
const PRIORITY_VARIANT = {
  Critical: 'danger',
  High: 'warning',
  Medium: 'info',
  Strong: 'success',
} as const

function scoreStatus(score: number): { label: string; variant: 'warning' | 'primary' | 'success' } {
  if (score >= 85) return { label: 'Job Ready', variant: 'success' }
  if (score >= 65) return { label: 'On Your Way', variant: 'primary' }
  return { label: 'Early Stage', variant: 'warning' }
}

function scoreColor(score: number): 'success' | 'brand' | 'warning' | 'danger' {
  if (score >= 80) return 'success'
  if (score >= 60) return 'brand'
  if (score >= 40) return 'warning'
  return 'danger'
}

function breakdownStatusText(score: number): string {
  if (score >= 85) return 'Excellent match'
  if (score >= 70) return 'Good foundation'
  if (score >= 50) return 'Moderate gap'
  return 'Needs improvement'
}

/* ══════════════════════════════════════════════════════════════
   Main JobReadinessPage Component
══════════════════════════════════════════════════════════════ */
export function JobReadinessPage() {
  const navigate = useNavigate()
  const { token } = useAuth()

  const [readinessData, setReadinessData] = useState<BackendReadinessResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [calcError, setCalcError] = useState<string | null>(null)

  const careerTarget = sessionStorage.getItem('cc_careerGoal') || 'Software Developer'

  const fetchReadiness = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    setError(null)
    setCalcError(null)

    try {
      const data = await getReadinessApi(token)
      setReadinessData(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load your job readiness score.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchReadiness()
  }, [fetchReadiness])

  const handleRecalculate = async () => {
    if (!token || isCalculating) return
    setIsCalculating(true)
    setCalcError(null)

    try {
      const updated = await calculateReadinessApi(token)
      setReadinessData(updated)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to recalculate score. Please try again.'
      setCalcError(msg)
    } finally {
      setIsCalculating(false)
    }
  }

  /* ── Derived Breakdown Items ──────────────────────────────── */
  const breakdownItems = useMemo(() => {
    if (!readinessData) return []
    const b = readinessData.breakdown
    return [
      { label: 'Technical Skills', score: b.technicalSkills, status: breakdownStatusText(b.technicalSkills) },
      { label: 'DSA & Algorithms', score: b.dsa, status: breakdownStatusText(b.dsa) },
      { label: 'Projects Portfolio', score: b.projects, status: breakdownStatusText(b.projects) },
      { label: 'Resume Score', score: b.resume, status: breakdownStatusText(b.resume) },
      { label: 'GitHub Activity', score: b.github, status: breakdownStatusText(b.github) },
      { label: 'Interview Readiness', score: b.interview, status: breakdownStatusText(b.interview) },
    ]
  }, [readinessData])

  /* ── Derived Strengths ────────────────────────────────────── */
  const strengths = useMemo(() => {
    if (!readinessData) return []
    const list: string[] = []
    const b = readinessData.breakdown
    if (b.technicalSkills >= 65) list.push('Solid technical skills foundation')
    if (b.github >= 60) list.push('Active GitHub profile & repositories')
    if (b.resume >= 70) list.push('Resume uploaded & AI verified')
    if (b.projects >= 65) list.push('Relevant project portfolio')
    if (b.dsa >= 70) list.push('Good Data Structures & Algorithms proficiency')
    if (b.interview >= 70) list.push('Strong interview preparedness')

    if (list.length === 0) {
      list.push('Active learning path started', 'Target career goal defined')
    }
    return list
  }, [readinessData])

  /* ── Derived Areas to Improve ─────────────────────────────── */
  const improveAreas = useMemo(() => {
    if (!readinessData?.improvements) return []
    return readinessData.improvements.map((imp, i) => {
      const isCritical = i === 0 || imp.toLowerCase().includes('dsa') || imp.toLowerCase().includes('system')
      return {
        name: imp,
        current: isCritical ? 35 : 55,
        target: isCritical ? 75 : 85,
        gap: isCritical ? 40 : 30,
        priority: isCritical ? ('Critical' as const) : ('High' as const)
      }
    })
  }, [readinessData])

  const overallScore = readinessData?.overallScore ?? 0
  const { label: statusLabel, variant: statusVariant } = scoreStatus(overallScore)

  /* ── Render Loading State ──────────────────────────────── */
  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-surface-900">Your Job Readiness</h1>
            <p className="text-sm text-surface-500 mt-1.5">Calculating your job readiness score...</p>
          </div>
        </div>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <RefreshCw size={36} className="text-brand-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-surface-900 mb-1">Analyzing Job Readiness</h3>
            <p className="text-sm text-surface-500 max-w-md">
              Evaluating your skills, resume, GitHub profile, projects, and interview scores...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  /* ── Render Error State ────────────────────────────────── */
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-surface-900">Your Job Readiness</h1>
          </div>
        </div>
        <Card padding="lg" className="border-danger-200 bg-danger-50/20">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle size={40} className="text-danger-500 mb-3" />
            <h3 className="text-lg font-semibold text-surface-900 mb-1">Unable to load your job readiness score</h3>
            <p className="text-sm text-surface-600 max-w-md mb-6">{error}</p>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={fetchReadiness}
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  /* ── Render Empty / Missing Profile State ────────────────── */
  if (!readinessData) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-surface-900">Your Job Readiness</h1>
          </div>
        </div>
        <Card padding="lg" className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <TrendingUp size={40} className="text-brand-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-surface-900">Profile Analysis Required</h3>
            <p className="text-sm text-surface-500">
              Please complete your profile input and AI career analysis before calculating your job readiness score.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" size="md" onClick={() => navigate('/profile-input')}>
                Profile Input
              </Button>
              <Button variant="primary" size="md" onClick={() => navigate('/analysis')}>
                Career Analysis
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  /* ── Render Main Content ───────────────────────────────── */
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-surface-900">Your Job Readiness</h1>
          <p className="text-sm text-surface-500 mt-1.5 leading-relaxed">
            See how prepared you are for your target career and what you should focus on next.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="primary" dot size="md">{careerTarget}</Badge>
          <Button
            variant="outline"
            size="xs"
            leftIcon={<RefreshCw size={12} className={clsx(isCalculating && 'animate-spin')} />}
            disabled={isCalculating}
            onClick={handleRecalculate}
          >
            {isCalculating ? 'Recalculating...' : 'Recalculate'}
          </Button>
        </div>
      </div>

      {/* Recalculation Error Banner */}
      {calcError && (
        <div className="p-3 bg-danger-50 border border-danger-200 text-danger-700 text-xs rounded-xl flex items-center justify-between">
          <span>{calcError}</span>
          <button onClick={() => setCalcError(null)} className="text-danger-500 font-bold hover:text-danger-800">
            ×
          </button>
        </div>
      )}

      {/* ── Score Hero ───────────────────────────────────── */}
      <Card padding="lg" className="bg-gradient-to-br from-brand-50/60 to-white border-brand-100">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Donut ring */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
              <circle
                cx="18" cy="18" r="15.9"
                fill="none" strokeWidth="3.5" strokeLinecap="round"
                stroke="#6366f1"
                strokeDasharray={`${overallScore} ${100 - overallScore}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-brand-600 leading-none">{overallScore}</span>
              <span className="text-xs text-surface-400 mt-0.5">/ 100</span>
            </div>
          </div>

          {/* Right text */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
              <h2 className="text-xl font-bold text-surface-900">Overall Job Readiness</h2>
              <Badge variant={statusVariant} size="md">{statusLabel}</Badge>
            </div>
            <p className="text-sm text-surface-500 leading-relaxed mb-4 max-w-sm">
              {overallScore >= 80
                ? "You're well prepared! Keep practicing mock interviews to refine your technical responses."
                : overallScore >= 60
                ? "You're building a strong foundation. Focus on your highest-priority skill gaps to become job ready."
                : "Complete your skill gap roadmap tasks and resume updates to boost your readiness score."}
            </p>
            <Progress
              value={overallScore}
              size="lg"
              color="brand"
              label="Readiness"
              showLabel
            />
          </div>
        </div>
      </Card>

      {/* ── Two-column Main Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Readiness Breakdown */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-brand-500" />
            <h2 className="text-sm font-semibold text-surface-900">Readiness Breakdown</h2>
          </div>
          <div className="space-y-4">
            {breakdownItems.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-surface-700">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-surface-400 hidden sm:block">{item.status}</span>
                    <span className={clsx(
                      'text-xs font-semibold',
                      item.score >= 80 ? 'text-success-600' :
                      item.score >= 60 ? 'text-brand-600' :
                      item.score >= 40 ? 'text-warning-600' : 'text-danger-600'
                    )}>
                      {item.score}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={item.score}
                  size="xs"
                  color={scoreColor(item.score)}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column Stack */}
        <div className="space-y-4">

          {/* Strengths */}
          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={15} className="text-success-500" />
              <h2 className="text-sm font-semibold text-surface-900">Your Strengths</h2>
            </div>
            <div className="space-y-2">
              {strengths.map((s) => (
                <div key={s} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={13} className="text-success-500 flex-shrink-0" />
                  <span className="text-surface-700">{s}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Profile Checklist */}
          <Card padding="md">
            <h2 className="text-sm font-semibold text-surface-900 mb-3">Profile Checklist</h2>
            <div className="space-y-1.5">
              {[
                'Career profile complete',
                'Resume uploaded',
                'GitHub connected',
                'Career selected',
                'Skill gaps identified',
                'Roadmap created',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={13} className="text-success-500 flex-shrink-0" />
                  <span className="text-surface-600">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Areas to Improve ─────────────────────────────── */}
      {improveAreas.length > 0 && (
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-warning-500" />
            <h2 className="text-sm font-semibold text-surface-900">Improve Before Applying</h2>
          </div>
          <div className="space-y-5">
            {improveAreas.map((area, i) => (
              <div key={area.name} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-surface-100 text-surface-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-sm font-semibold text-surface-800">{area.name}</span>
                    <Badge variant={PRIORITY_VARIANT[area.priority]} size="sm">{area.priority}</Badge>
                  </div>
                  <div className="relative h-2 rounded-full bg-surface-100 overflow-visible mb-1">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-surface-400 z-10 rounded-full"
                      style={{ left: `${area.target}%` }}
                      aria-label={`Target ${area.target}%`}
                    />
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-700',
                        area.priority === 'Critical' ? 'bg-danger-400' : 'bg-warning-400'
                      )}
                      style={{ width: `${area.current}%` }}
                    />
                  </div>
                  <div className="flex gap-4 text-xs text-surface-400">
                    <span>Current {area.current}%</span>
                    <span>Target {area.target}%</span>
                    <span className="text-warning-600 font-medium">{area.gap}pt gap</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Progress Summary Row ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Roadmap Progress */}
        <Card padding="md">
          <h2 className="text-sm font-semibold text-surface-900 mb-3">Roadmap Progress</h2>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl font-bold text-brand-600">35%</span>
            <div className="text-xs text-surface-500">
              <p>12-week roadmap</p>
              <p className="mt-0.5">Focus on skill modules</p>
            </div>
          </div>
          <Progress value={35} size="sm" color="brand" className="mb-3" />
          <Button
            variant="outline"
            size="sm"
            fullWidth
            rightIcon={<ChevronRight size={13} />}
            onClick={() => navigate('/roadmap')}
          >
            Continue Roadmap
          </Button>
        </Card>

        {/* Course Progress */}
        <Card padding="md">
          <h2 className="text-sm font-semibold text-surface-900 mb-3">Learning Progress</h2>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl font-bold text-brand-600">
              {readinessData.breakdown.technicalSkills}%
            </span>
            <div className="text-xs text-surface-500">
              <p>IBM SkillsBuild courses</p>
              <p className="mt-0.5">Skill acquisition score</p>
            </div>
          </div>
          <Progress value={readinessData.breakdown.technicalSkills} size="sm" color="brand" className="mb-3" />
          <Button
            variant="outline"
            size="sm"
            fullWidth
            rightIcon={<ChevronRight size={13} />}
            onClick={() => navigate('/courses')}
          >
            Continue Learning
          </Button>
        </Card>
      </div>

      {/* ── Next Best Action ──────────────────────────────── */}
      <Card padding="lg" className="border-brand-200 bg-brand-50/30">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0">
            <ArrowRight size={17} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">
              Your Next Best Action
            </p>
            <h3 className="text-base font-bold text-surface-900 mb-1">
              {improveAreas[0]?.name || 'Improve Skill Gaps'}
            </h3>
            <p className="text-sm text-surface-500 leading-relaxed mb-4">
              Focusing on your primary skill gaps will have the highest immediate impact on your overall job readiness.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ChevronRight size={15} />}
                onClick={() => navigate('/roadmap')}
              >
                Continue Roadmap
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/skill-gap')}
              >
                View Skill Gap
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Mock Interview CTA ───────────────────────────── */}
      <Card padding="lg" className="border-surface-200">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
            <ChevronRight size={17} className="text-surface-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
              Final Step
            </p>
            <h3 className="text-base font-bold text-surface-900 mb-1">
              Practice with a Mock Interview
            </h3>
            <p className="text-sm text-surface-500 leading-relaxed mb-4">
              Test your readiness with behavioral and technical questions tailored to your target career.
              Get instant AI feedback on your responses.
            </p>
            <Button
              variant="primary"
              size="md"
              rightIcon={<ChevronRight size={15} />}
              onClick={() => navigate('/mock-interview')}
            >
              Start Mock Interview
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Journey Indicator ────────────────────────────── */}
      <div className="pt-4 border-t border-surface-100">
        <p className="text-xs text-surface-400 mb-2 font-medium">Your career journey</p>
        <JourneyIndicator activeStep={7} />
      </div>
    </div>
  )
}
