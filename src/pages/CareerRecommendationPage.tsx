import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Card, CardTitle, CardDescription, Badge, Button, Progress } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { getCareerRecommendationsApi, CareerRecommendationItem } from '../api/career'
import { JourneyIndicator } from '../components/JourneyIndicator'

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

/* ── Match score colour ─────────────────────────────────────── */
function matchColor(pct: number): 'success' | 'brand' | 'warning' {
  if (pct >= 85) return 'success'
  if (pct >= 70) return 'brand'
  return 'warning'
}

/* ══════════════════════════════════════════════════════════════
   Featured recommendation card
══════════════════════════════════════════════════════════════ */
function FeaturedCard({ item }: { item: CareerRecommendationItem }) {
  const navigate = useNavigate()
  const fitTag = getFitTag(item.matchPercentage)
  const targetId = item.careerId || item.id

  return (
    <Card padding="lg" className="border-brand-200 bg-gradient-to-br from-brand-50/60 to-white">
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        {/* Left text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-2">
            Your strongest career match
          </p>
          <h2 className="text-2xl font-bold text-surface-900 mb-1">{item.career}</h2>
          <p className="text-sm text-surface-500 leading-relaxed mb-4">
            Your current skills and project experience strongly align with this career path.
          </p>

          {/* Why this matches */}
          <p className="text-xs font-semibold text-surface-600 uppercase tracking-wide mb-2">
            Why this matches you
          </p>
          <ul className="space-y-1.5 mb-5">
            {item.reasons && item.reasons.length > 0 ? (
              item.reasons.map((reason) => (
                <li key={reason} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={14} className="text-success-500 flex-shrink-0" />
                  <span className="text-surface-700">{reason}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-surface-500 italic">No specific reasons generated yet.</li>
            )}
          </ul>

          <Button
            variant="primary"
            size="md"
            rightIcon={<ChevronRight size={15} />}
            onClick={() => navigate(`/career/${targetId}`)}
          >
            Explore Career
          </Button>
        </div>

        {/* Right: big match score */}
        <div className="flex flex-col items-center justify-center gap-3 sm:w-36 flex-shrink-0">
          <div className="relative w-28 h-28">
            {/* SVG donut */}
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeDasharray={`${item.matchPercentage} ${100 - item.matchPercentage}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-brand-600 leading-none">{item.matchPercentage}%</span>
              <span className="text-xs text-surface-400 mt-0.5">Match</span>
            </div>
          </div>
          <Badge variant={fitVariant(fitTag)} dot size="md">{fitTag} fit</Badge>
        </div>
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Career match list card
══════════════════════════════════════════════════════════════ */
function MatchCard({ item, rank }: { item: CareerRecommendationItem; rank: number }) {
  const navigate = useNavigate()
  const fitTag = getFitTag(item.matchPercentage)
  const targetId = item.careerId || item.id

  const shortWhy = item.reasons && item.reasons.length > 0
    ? item.reasons.join('. ')
    : 'Strong match based on user profile and skills.'

  const strengths = item.reasons || []
  const mainGap = item.requiredSkills && item.requiredSkills.length > 0
    ? item.requiredSkills[0]
    : 'System Design'

  return (
    <Card hoverable padding="md" onClick={() => navigate(`/career/${targetId}`)}>
      <div className="flex items-start gap-3">
        {/* Rank bubble */}
        <div className="w-7 h-7 rounded-full bg-surface-100 text-surface-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-semibold text-surface-900">{item.career}</h3>
            <Badge variant={fitVariant(fitTag)} size="sm" dot>{fitTag}</Badge>
          </div>
          <p className="text-xs text-surface-500 leading-relaxed mb-3 line-clamp-2">{shortWhy}</p>

          {/* Match bar */}
          <Progress
            value={item.matchPercentage}
            size="sm"
            color={matchColor(item.matchPercentage)}
            label="Match"
            showLabel
            className="mb-3"
          />

          {/* Strengths + gap row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              {strengths.slice(0, 3).map((s) => (
                <Badge key={s} variant="default" size="sm">{s}</Badge>
              ))}
            </div>
            <span className="text-surface-400 flex items-center gap-1">
              <ArrowRight size={11} className="text-warning-500" />
              Improve: <span className="text-warning-600 font-medium">{mainGap}</span>
            </span>
          </div>
        </div>

        {/* CTA */}
        <Button
          variant="outline"
          size="xs"
          className="flex-shrink-0 self-start mt-0.5"
          onClick={(e) => { e.stopPropagation(); navigate(`/career/${targetId}`) }}
        >
          View Details
        </Button>
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Comparison table
══════════════════════════════════════════════════════════════ */
function ComparisonTable({ items }: { items: CareerRecommendationItem[] }) {
  const navigate = useNavigate()

  return (
    <Card padding="none">
      <div className="px-5 pt-5 pb-3 border-b border-surface-100">
        <CardTitle>Compare your top career paths</CardTitle>
        <CardDescription className="mt-0.5">Side-by-side snapshot of your career matches</CardDescription>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-surface-100">
              {['Career', 'Match', 'Current Fit', 'Main Gap', ''].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-50">
            {items.map((row) => {
              const fitTag = getFitTag(row.matchPercentage)
              const mainGap = row.requiredSkills && row.requiredSkills.length > 0
                ? row.requiredSkills[0]
                : 'Advanced Concepts'
              const targetId = row.careerId || row.id

              return (
                <tr key={row.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-surface-800 whitespace-nowrap">{row.career}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand-600">{row.matchPercentage}%</span>
                      <div className="w-16 h-1.5 rounded-full bg-surface-100 overflow-hidden hidden sm:block">
                        <div
                          className={clsx(
                            'h-full rounded-full',
                            row.matchPercentage >= 85 ? 'bg-success-500' :
                            row.matchPercentage >= 70 ? 'bg-brand-500' : 'bg-warning-500'
                          )}
                          style={{ width: `${row.matchPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={fitVariant(fitTag)} size="sm" dot>{fitTag}</Badge>
                  </td>
                  <td className="px-5 py-3 text-surface-500 text-xs">{mainGap}</td>
                  <td className="px-5 py-3">
                    <Button
                      variant="ghost"
                      size="xs"
                      rightIcon={<ChevronRight size={12} />}
                      onClick={() => navigate(`/career/${targetId}`)}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main page
══════════════════════════════════════════════════════════════ */
export function CareerRecommendationPage() {
  const { token } = useAuth()
  const [recommendations, setRecommendations] = useState<CareerRecommendationItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = async () => {
    if (!token) {
      setError('You must be logged in to view career recommendations.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await getCareerRecommendationsApi(token)
      setRecommendations(data || [])
    } catch (err: any) {
      if (err?.status === 401) {
        setError('Your session has expired. Please log in again.')
      } else {
        setError(err.message || 'Failed to load career recommendations.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [token])

  const topMatch = recommendations[0]

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="success" dot size="md">AI Career Analysis Complete</Badge>
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Your Career Matches</h1>
          <p className="text-sm text-surface-500 mt-1.5 leading-relaxed max-w-xl">
            Based on your skills, experience, projects and interests, these career paths
            are the strongest fit for you.
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-1 text-xs text-surface-400">
          <Sparkles size={12} className="text-brand-400" />
          Powered by AI Career Copilot
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <Card padding="lg" className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-600 mb-4 animate-spin">
            <RefreshCw size={24} />
          </div>
          <p className="text-surface-700 font-medium">Loading your career recommendations...</p>
          <p className="text-xs text-surface-400 mt-1">Analyzing backend match parameters</p>
        </Card>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <Card padding="lg" className="border-danger-200 bg-danger-50/50">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-danger-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-danger-900">Unable to load recommendations</h3>
              <p className="text-sm text-danger-700 mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 bg-white"
                leftIcon={<RefreshCw size={14} />}
                onClick={fetchRecommendations}
              >
                Retry Request
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Empty recommendations state */}
      {!isLoading && !error && recommendations.length === 0 && (
        <Card padding="lg" className="text-center py-12">
          <p className="text-surface-700 font-medium text-base">No career recommendations found</p>
          <p className="text-sm text-surface-500 mt-1 max-w-md mx-auto">
            Complete your onboarding profile or run full AI analysis to generate personalized career matches.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={fetchRecommendations}
          >
            Refresh Recommendations
          </Button>
        </Card>
      )}

      {/* Main content when recommendations exist */}
      {!isLoading && !error && recommendations.length > 0 && (
        <>
          {/* Featured card */}
          {topMatch && <FeaturedCard item={topMatch} />}

          {/* Other matches */}
          {recommendations.length > 1 && (
            <div>
              <h2 className="text-base font-semibold text-surface-800 mb-3">Other career matches</h2>
              <div className="space-y-3">
                {recommendations.slice(1).map((item, i) => (
                  <MatchCard key={item.id} item={item} rank={i + 2} />
                ))}
              </div>
            </div>
          )}

          {/* Comparison table */}
          <ComparisonTable items={recommendations} />
        </>
      )}

      {/* Journey indicator */}
      <div className="pt-4 border-t border-surface-100">
        <p className="text-xs text-surface-400 mb-2 font-medium">Your career journey</p>
        <JourneyIndicator activeStep={3} />
      </div>
    </div>
  )
}
