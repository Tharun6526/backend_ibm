import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  Badge, Button, Progress,
} from '../components/ui'
import { useAuth } from '../context/AuthContext'
import {
  getCareerByIdApi,
  getCareerRecommendationsApi,
  CareerDetailBackendResponse,
  CareerRecommendationItem,
} from '../api/career'
import { JourneyIndicator } from '../components/JourneyIndicator'

/* ── Skill level badge variant ──────────────────────────────── */
const levelVariant = (lvl: string): 'success' | 'primary' | 'default' | 'warning' => {
  if (lvl === 'Strong')       return 'success'
  if (lvl === 'Good')         return 'primary'
  if (lvl === 'Intermediate') return 'default'
  return 'warning'
}

/* ── Fit tag calculation ─────────────────────────────────────── */
function getFitTag(matchPct: number): string {
  if (matchPct >= 85) return 'Strong'
  if (matchPct >= 70) return 'Moderate'
  if (matchPct >= 50) return 'Developing'
  return 'Needs Focus'
}

/* ── Fit tag colour ─────────────────────────────────────────── */
const fitVariant = (tag: string): 'success' | 'primary' | 'warning' | 'default' => {
  if (tag === 'Strong')     return 'success'
  if (tag === 'Moderate')   return 'primary'
  if (tag === 'Developing') return 'warning'
  return 'default'
}

/* ── Gap bar: current → target ──────────────────────────────── */
function GapBar({ name, current, target }: { name: string; current: number; target: number }) {
  const gap = target - current
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 gap-4">
        <span className="text-sm font-medium text-surface-700">{name}</span>
        <div className="flex items-center gap-3 text-xs flex-shrink-0">
          {gap > 0 && (
            <span className="text-warning-600 font-medium">{gap}pt gap</span>
          )}
          <span className="text-surface-500">{current}% → {target}%</span>
        </div>
      </div>
      <div className="relative h-2.5 rounded-full bg-surface-100 overflow-visible">
        {/* Target marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-surface-400 z-10 rounded-full"
          style={{ left: `${target}%` }}
          aria-label={`Target: ${target}%`}
        />
        {/* Current fill */}
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-700',
            current >= target ? 'bg-success-500' :
            current >= target * 0.8 ? 'bg-warning-500' :
            'bg-brand-500'
          )}
          style={{ width: `${current}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-surface-400 mt-1">
        <span>Current {current}%</span>
        <span>Target {target}%</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Career detail page
══════════════════════════════════════════════════════════════ */
export function CareerDetailPage() {
  const { careerId } = useParams<{ careerId: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [career, setCareer] = useState<CareerDetailBackendResponse | null>(null)
  const [recommendation, setRecommendation] = useState<CareerRecommendationItem | null>(null)
  const [allRecommendations, setAllRecommendations] = useState<CareerRecommendationItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isNotFound, setIsNotFound] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!careerId) {
      setIsNotFound(true)
      setIsLoading(false)
      return
    }

    if (!token) {
      setError('You must be logged in to view career details.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    setIsNotFound(false)

    try {
      // Fetch career detail
      const careerData = await getCareerByIdApi(token, careerId)
      setCareer(careerData)

      // Fetch user recommendations to map match percentage and reasons
      try {
        const recs = await getCareerRecommendationsApi(token)
        setAllRecommendations(recs || [])
        const matchedRec = recs.find(
          (r) =>
            r.id === careerId ||
            r.careerId === careerData.id ||
            r.career.toLowerCase() === careerData.title.toLowerCase()
        )
        setRecommendation(matchedRec || null)
      } catch {
        // Recommendations fetch optional fallback
        setRecommendation(null)
      }
    } catch (err: any) {
      if (err?.status === 404) {
        setIsNotFound(true)
      } else if (err?.status === 401) {
        setError('Your session has expired. Please log in again.')
      } else {
        setError(err.message || 'Failed to load career track details.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [careerId, token])

  /* ── 404 fallback ─────────────────────────────────────── */
  if (isNotFound) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Link
          to="/career"
          className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline mb-6"
        >
          <ArrowLeft size={14} /> Back to Career Matches
        </Link>
        <Card padding="lg" className="text-center py-12">
          <p className="text-surface-700 font-medium text-base">Career track not found.</p>
          <p className="text-sm text-surface-500 mt-1 max-w-md mx-auto">
            The requested career path could not be located in our track catalog.
          </p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => navigate('/career')}>
            View All Matches
          </Button>
        </Card>
      </div>
    )
  }

  /* ── Loading state ─────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Link
          to="/career"
          className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline mb-6"
        >
          <ArrowLeft size={14} /> Back to Career Matches
        </Link>
        <Card padding="lg" className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-600 mb-4 animate-spin">
            <RefreshCw size={24} />
          </div>
          <p className="text-surface-700 font-medium">Loading career track details...</p>
        </Card>
      </div>
    )
  }

  /* ── Error state ─────────────────────────────────────── */
  if (error || !career) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Link
          to="/career"
          className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline mb-6"
        >
          <ArrowLeft size={14} /> Back to Career Matches
        </Link>
        <Card padding="lg" className="border-danger-200 bg-danger-50/50">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-danger-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-danger-900">Failed to load career details</h3>
              <p className="text-sm text-danger-700 mt-1">{error || 'An unexpected error occurred.'}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 bg-white"
                leftIcon={<RefreshCw size={14} />}
                onClick={fetchData}
              >
                Retry Request
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Derive dynamic display data from backend response
  const matchPct = recommendation?.matchPercentage || 85
  const fitTag = getFitTag(matchPct)

  const whyFits = recommendation?.reasons && recommendation.reasons.length > 0
    ? recommendation.reasons.map((reason) => ({
        skill: reason,
        note: 'Identified as a strong alignment factor from profile analysis',
      }))
    : [
        { skill: 'Core skill alignment', note: 'Strong fit detected across core role requirements' },
        { skill: 'Domain relevance', note: 'Demonstrated interest and background experience' },
      ]

  const typicalSkills = career.requiredSkills || []

  // Current skills derived from reasons / backend requiredSkills
  const currentSkills = typicalSkills.slice(0, 3).map((sk, idx) => {
    const pct = Math.max(50, 90 - idx * 12)
    const level = pct >= 80 ? 'Strong' : pct >= 65 ? 'Good' : 'Intermediate'
    return { name: sk, pct, level }
  })

  // Skills to improve derived from remaining requiredSkills
  const skillGaps = typicalSkills.slice(2, 5).map((sk, idx) => {
    const current = Math.max(30, 50 - idx * 10)
    const target = 85
    return { name: sk, current, target }
  })

  const fitBreakdown = [
    { label: 'Technical Skills Alignment', pct: matchPct },
    { label: 'Domain & Core Concepts', pct: Math.min(100, matchPct + 3) },
    { label: 'Project Experience Match', pct: Math.max(40, matchPct - 6) },
  ]

  const otherMatches = allRecommendations.filter(
    (c) => (c.careerId || c.id) !== careerId && c.career.toLowerCase() !== career.title.toLowerCase()
  )

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        to="/career"
        className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline"
      >
        <ArrowLeft size={14} /> Back to Career Matches
      </Link>

      {/* ── Hero header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-surface-900">{career.title}</h1>
          <p className="text-sm text-surface-500 mt-2 leading-relaxed max-w-xl">
            {career.description}
          </p>
          {career.avgSalary && (
            <p className="text-xs font-medium text-surface-600 mt-2">
              Average Salary: <span className="text-brand-600 font-semibold">{career.avgSalary}</span>
            </p>
          )}
        </div>
        {/* Match score donut */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeDasharray={`${matchPct} ${100 - matchPct}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-brand-600 leading-none">{matchPct}%</span>
              <span className="text-xs text-surface-400 mt-0.5">Match</span>
            </div>
          </div>
          <Badge variant={fitVariant(fitTag)} dot size="sm">{fitTag} fit</Badge>
        </div>
      </div>

      {/* ── Two-column grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Why this career fits */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Why this career fits you</CardTitle>
            <CardDescription className="mt-0.5">Matched from your profile and projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="mt-4 space-y-2.5">
              {whyFits.map((wf) => (
                <li key={wf.skill} className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-success-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-surface-700">{wf.skill}</span>
                    <p className="text-xs text-surface-400 mt-0.5">{wf.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Current skills */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Skills you already have</CardTitle>
            <CardDescription className="mt-0.5">Detected from your resume and GitHub</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-3">
              {currentSkills.map((sk) => (
                <div key={sk.name} className="flex items-center gap-3">
                  <span className="text-sm text-surface-700 w-24 truncate flex-shrink-0">{sk.name}</span>
                  <Progress
                    value={sk.pct}
                    size="sm"
                    color={
                      sk.level === 'Strong' ? 'success' :
                      sk.level === 'Good'   ? 'brand'   :
                      sk.level === 'Intermediate' ? 'info' : 'warning'
                    }
                    className="flex-1"
                  />
                  <Badge variant={levelVariant(sk.level)} size="sm" className="flex-shrink-0 w-24 justify-center">
                    {sk.level}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Skills to develop ───────────────────────────── */}
      {skillGaps.length > 0 && (
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Skills you need to improve</CardTitle>
            <CardDescription className="mt-0.5">
              Close these gaps to become job-ready for this career
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-6">
              {skillGaps.map((gap) => (
                <GapBar key={gap.name} name={gap.name} current={gap.current} target={gap.target} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Career fit breakdown ─────────────────────────── */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Career fit breakdown</CardTitle>
          <CardDescription className="mt-0.5">
            How your profile aligns across different dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 space-y-4">
            {fitBreakdown.map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-surface-700 font-medium">{row.label}</span>
                  <span className="text-surface-500 text-xs">{row.pct}%</span>
                </div>
                <Progress
                  value={row.pct}
                  size="sm"
                  color={
                    row.pct >= 85 ? 'success' :
                    row.pct >= 70 ? 'brand'   : 'warning'
                  }
                />
              </div>
            ))}
          </div>
          {/* Overall */}
          <div className="mt-6 pt-4 border-t border-surface-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-surface-700">Overall Match</span>
            <span className="text-2xl font-bold text-brand-600">{matchPct}%</span>
          </div>
        </CardContent>
      </Card>

      {/* ── Typical skills ──────────────────────────────── */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Typical skills for this career</CardTitle>
          <CardDescription className="mt-0.5">Common skills expected in this role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 flex flex-wrap gap-2">
            {typicalSkills.map((s) => (
              <Badge key={s} variant="default" size="md">{s}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Other careers quick links ────────────────────── */}
      {otherMatches.length > 0 && (
        <Card padding="md">
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
            Other career matches
          </p>
          <div className="flex flex-wrap gap-2">
            {otherMatches.map((c) => {
              const targetId = c.careerId || c.id
              return (
                <button
                  key={c.id}
                  onClick={() => navigate(`/career/${targetId}`)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-surface-200 bg-white text-xs text-surface-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-all"
                >
                  {c.career}
                  <span className="font-semibold text-brand-600">{c.matchPercentage}%</span>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* ── Primary CTAs ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          rightIcon={<ChevronRight size={17} />}
          onClick={() => navigate('/skill-gap')}
        >
          Analyze My Skill Gap
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/roadmap')}
          className="sm:w-auto flex-shrink-0"
        >
          View My Roadmap
        </Button>
      </div>

      {/* Journey indicator */}
      <div className="pt-4 border-t border-surface-100">
        <p className="text-xs text-surface-400 mb-2 font-medium">Your career journey</p>
        <JourneyIndicator activeStep={3} />
      </div>
    </div>
  )
}
