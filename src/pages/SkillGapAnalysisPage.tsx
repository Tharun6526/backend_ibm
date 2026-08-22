import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  Target,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Badge, Button, Progress,
} from '../components/ui'
import { JourneyIndicator } from '../components/JourneyIndicator'
import { useAuth } from '../context/AuthContext'
import { getSkillGapsApi, getUserSkillsApi, SkillGapItem, UserSkillItem } from '../api/skill'
import {
  PRIORITY_VARIANT,
  type Priority,
  type SkillItem,
  type SkillCategory,
  type StrongSkill,
  type FocusArea,
} from '../data/skillGapData'

/* ── Helpers ────────────────────────────────────────────────── */
function mapPriority(raw: string): Priority {
  const upper = raw ? raw.toUpperCase() : ''
  if (upper === 'CRITICAL') return 'Critical'
  if (upper === 'HIGH') return 'High'
  if (upper === 'MEDIUM') return 'Medium'
  return 'Strong'
}

function currentFillColor(current: number, target: number): string {
  const ratio = current / (target || 1)
  if (ratio >= 1)    return 'bg-success-500'
  if (ratio >= 0.85) return 'bg-brand-500'
  if (ratio >= 0.65) return 'bg-warning-500'
  return 'bg-danger-500'
}

/* ── Gap bar: current fill + target marker ──────────────────── */
function GapBar({
  current,
  target,
  size = 'md',
}: {
  current: number
  target:  number
  size?:   'sm' | 'md'
}) {
  const h = size === 'sm' ? 'h-2' : 'h-2.5'
  return (
    <div className={`relative rounded-full bg-surface-100 overflow-visible ${h}`}>
      {/* Target marker */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-surface-400 z-10 rounded-full"
        style={{ left: `${Math.min(100, target)}%` }}
        aria-label={`Target ${target}%`}
      />
      {/* Fill */}
      <div
        className={clsx('h-full rounded-full transition-all duration-700', currentFillColor(current, target))}
        style={{ width: `${Math.min(100, current)}%` }}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Current: ${current}%, Target: ${target}%`}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Summary hero card
══════════════════════════════════════════════════════════════ */
function SummaryCard({
  overallCurrent,
  overallTarget,
  careerTarget,
  skillsEvaluated,
  strongSkillCount,
  improvementCount,
}: {
  overallCurrent: number
  overallTarget: number
  careerTarget: string
  skillsEvaluated: number
  strongSkillCount: number
  improvementCount: number
}) {
  const gap = Math.max(0, overallTarget - overallCurrent)

  return (
    <Card padding="lg" className="bg-gradient-to-br from-brand-50/60 to-white border-brand-100">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Left: text + bar */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-1">
            Current Skill Alignment
          </p>
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-4xl font-bold text-surface-900">{overallCurrent}%</span>
            <span className="text-sm text-surface-400">of {overallTarget}% target</span>
          </div>
          <p className="text-sm text-surface-500 mb-4">
            Career: <strong className="text-surface-700">{sessionStorage.getItem('cc_careerGoal') || careerTarget}</strong>
            <span className="mx-2 text-surface-200">·</span>
            Gap: <strong className="text-warning-600">{gap}%</strong>
          </p>
          {/* Double bar — current over target */}
          <div className="space-y-1.5 mb-1">
            <div className="flex justify-between text-xs text-surface-500 mb-1">
              <span>Current alignment</span>
              <span>{overallCurrent}%</span>
            </div>
            <GapBar current={overallCurrent} target={overallTarget} size="md" />
            <div className="flex justify-between text-xs text-surface-400">
              <span>0%</span>
              <span className="text-brand-500 font-medium">Target {overallTarget}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Right: stat pills */}
        <div className="flex sm:flex-col gap-3 flex-shrink-0">
          {[
            { label: 'Skills Evaluated',  value: skillsEvaluated,   color: 'text-surface-700', bg: 'bg-surface-50' },
            { label: 'Strong Skills',      value: strongSkillCount,  color: 'text-success-700', bg: 'bg-success-50' },
            { label: 'Need Improvement',   value: improvementCount,  color: 'text-warning-700', bg: 'bg-warning-50' },
          ].map((s) => (
            <div key={s.label} className={clsx('flex flex-col items-center px-4 py-2.5 rounded-xl border border-surface-100', s.bg)}>
              <span className={clsx('text-2xl font-bold leading-none', s.color)}>{s.value}</span>
              <span className="text-xs text-surface-500 mt-1 text-center whitespace-nowrap">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Category grid
══════════════════════════════════════════════════════════════ */
function CategoryGrid({ categories }: { categories: SkillCategory[] }) {
  if (categories.length === 0) return null

  return (
    <div>
      <h2 className="text-base font-semibold text-surface-800 mb-3">Skill categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((cat) => {
          const gap = Math.max(0, cat.target - cat.current)
          const isStrong = cat.current >= cat.target
          return (
            <Card key={cat.id} padding="md" hoverable>
              <p className="text-xs font-semibold text-surface-600 truncate mb-1">{cat.name}</p>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-2xl font-bold text-surface-900">{cat.current}%</span>
                {!isStrong && (
                  <span className="text-xs text-surface-400">/ {cat.target}%</span>
                )}
              </div>
              <GapBar current={cat.current} target={cat.target} size="sm" />
              <div className="flex items-center justify-between mt-2">
                {isStrong ? (
                  <Badge variant="success" size="sm" dot>Strong</Badge>
                ) : (
                  <Badge variant={gap >= 30 ? 'danger' : gap >= 15 ? 'warning' : 'info'} size="sm">
                    {gap}pt gap
                  </Badge>
                )}
                <span className="text-xs text-surface-400">Target {cat.target}%</span>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Priority section
══════════════════════════════════════════════════════════════ */
function PrioritySection({ byPriority }: { byPriority: Record<Priority, string[]> }) {
  const priorities: Priority[] = ['Critical', 'High', 'Medium', 'Strong']

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Skills by priority</CardTitle>
        <CardDescription className="mt-0.5">What to focus on based on impact and gap size</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-4">
          {priorities.map((priority) => {
            const list = byPriority[priority] || []
            if (list.length === 0) return null
            return (
              <div key={priority} className="flex items-start gap-3">
                <Badge
                  variant={PRIORITY_VARIANT[priority]}
                  size="sm"
                  className="mt-0.5 flex-shrink-0 w-16 justify-center"
                >
                  {priority}
                </Badge>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 rounded-full bg-surface-100 text-surface-700 text-xs font-medium border border-surface-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Skill detail card
══════════════════════════════════════════════════════════════ */
function SkillDetailCard({ skill }: { skill: SkillItem }) {
  const navigate = useNavigate()
  const isExpanded = !!skill.subSkills

  return (
    <Card padding="lg">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-semibold text-surface-900">{skill.name}</h3>
            <Badge variant={PRIORITY_VARIANT[skill.priority]} size="sm">{skill.priority}</Badge>
          </div>
          <p className="text-xs text-surface-500 leading-relaxed">{skill.description}</p>
        </div>
        {/* Score ring */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="relative w-14 h-14">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={`${Math.min(100, skill.current)} ${100 - Math.min(100, skill.current)}`}
                className={clsx(
                  skill.priority === 'Critical' ? 'stroke-danger-500' :
                  skill.priority === 'High'     ? 'stroke-warning-500' :
                  skill.priority === 'Medium'   ? 'stroke-brand-500' :
                  'stroke-success-500'
                )}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-surface-700">{skill.current}%</span>
            </div>
          </div>
          <span className="text-xs text-surface-400">/ {skill.target}%</span>
        </div>
      </div>

      {/* Main gap bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-surface-500 mb-1.5">
          <span>Current {skill.current}%</span>
          <span className={clsx(
            'font-semibold',
            skill.gap >= 30 ? 'text-danger-600' : skill.gap >= 15 ? 'text-warning-600' : 'text-brand-600'
          )}>
            {skill.gap}pt gap
          </span>
          <span>Target {skill.target}%</span>
        </div>
        <GapBar current={skill.current} target={skill.target} size="md" />
      </div>

      {/* Sub-skills */}
      {isExpanded && skill.subSkills && (
        <div className="mb-4 space-y-2.5">
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Sub-skills</p>
          {skill.subSkills.map((sub) => (
            <div key={sub.name} className="flex items-center gap-3">
              <span className="text-xs text-surface-600 w-24 flex-shrink-0">{sub.name}</span>
              <Progress
                value={sub.current}
                size="xs"
                color={sub.current >= 70 ? 'success' : sub.current >= 50 ? 'brand' : 'warning'}
                className="flex-1"
              />
              <span className="text-xs text-surface-500 w-8 text-right flex-shrink-0">{sub.current}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Recommended action */}
      {skill.recommendedAction && (
        <div className="flex items-start gap-2 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2.5 mb-4">
          <AlertTriangle size={13} className="text-brand-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-brand-700 leading-relaxed">{skill.recommendedAction}</p>
        </div>
      )}

      {/* CTA */}
      <Button
        variant="outline"
        size="sm"
        rightIcon={<ChevronRight size={13} />}
        onClick={() => navigate('/roadmap')}
      >
        View Roadmap
      </Button>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Strong skills section
══════════════════════════════════════════════════════════════ */
function StrongSkillsSection({ strongSkills }: { strongSkills: StrongSkill[] }) {
  if (strongSkills.length === 0) return null

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-success-500" />
          <CardTitle>Your strong skills</CardTitle>
        </div>
        <CardDescription className="mt-1">
          These skills already align well with your recommended career.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-3">
          {strongSkills.map((sk) => (
            <div key={sk.name} className="flex items-center gap-3">
              <span className="text-sm font-medium text-surface-700 w-28 truncate flex-shrink-0">{sk.name}</span>
              <Progress
                value={sk.score}
                size="sm"
                color="success"
                className="flex-1"
              />
              <span className="text-xs text-success-600 font-semibold w-8 text-right flex-shrink-0">{sk.score}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Focus next section
══════════════════════════════════════════════════════════════ */
function FocusNextSection({ focusAreas }: { focusAreas: FocusArea[] }) {
  const navigate = useNavigate()

  if (focusAreas.length === 0) return null

  return (
    <Card padding="lg" className="border-brand-100">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target size={16} className="text-brand-500" />
          <CardTitle>What should you focus on next?</CardTitle>
        </div>
        <CardDescription className="mt-0.5">
          Ranked by impact on your readiness score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-4">
          {focusAreas.map((area, i) => (
            <div key={area.name} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-surface-100 flex items-center justify-center text-xs font-bold text-surface-600 flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-sm font-semibold text-surface-800">{area.name}</span>
                  <Badge variant={PRIORITY_VARIANT[area.priority]} size="sm">{area.priority}</Badge>
                </div>
                <GapBar current={area.current} target={area.target} size="sm" />
                <div className="flex items-center gap-4 mt-1 text-xs text-surface-400">
                  <span>Current {area.current}%</span>
                  <span>Target {area.target}%</span>
                  <span className="text-warning-600 font-medium">{area.gap}pt gap</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="primary"
          size="md"
          fullWidth
          rightIcon={<ChevronRight size={15} />}
          onClick={() => navigate('/roadmap')}
        >
          Build My Roadmap
        </Button>
      </CardFooter>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Insight card
══════════════════════════════════════════════════════════════ */
function InsightCard({ topGaps, careerTarget }: { topGaps: string[]; careerTarget: string }) {
  const gapText = topGaps.length > 0 ? topGaps.join(' and ') : 'core technical skills'

  return (
    <Card padding="md" className="border-brand-100 bg-brand-50/40">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
          <Lightbulb size={15} className="text-brand-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-1">
            Your biggest opportunity
          </p>
          <p className="text-sm text-surface-700 leading-relaxed">
            Improving <strong>{gapText}</strong> will have the largest impact on your readiness for{' '}
            <strong>{careerTarget}</strong> roles.
          </p>
        </div>
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main page
══════════════════════════════════════════════════════════════ */
export function SkillGapAnalysisPage() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [skillGaps, setSkillGaps] = useState<SkillGapItem[]>([])
  const [userSkills, setUserSkills] = useState<UserSkillItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!token) {
      setError('You must be logged in to view your skill gap analysis.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [gapsData, userSkillsData] = await Promise.all([
        getSkillGapsApi(token).catch(() => []),
        getUserSkillsApi(token).catch(() => []),
      ])

      setSkillGaps(gapsData || [])
      setUserSkills(userSkillsData || [])
    } catch (err: any) {
      if (err?.status === 401) {
        setError('Your session has expired. Please log in again.')
      } else {
        setError('Unable to load your skill gap analysis.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  // Normalization logic
  const careerTarget = sessionStorage.getItem('cc_careerGoal') || 'Software Developer'

  const overallCurrent = skillGaps.length > 0
    ? Math.round(skillGaps.reduce((acc, g) => acc + g.currentLevel, 0) / skillGaps.length)
    : userSkills.length > 0
    ? Math.round(userSkills.reduce((acc, s) => acc + s.level, 0) / userSkills.length)
    : 70

  const overallTarget = skillGaps.length > 0
    ? Math.round(skillGaps.reduce((acc, g) => acc + g.requiredLevel, 0) / skillGaps.length)
    : 85

  const skillsEvaluated = Math.max(skillGaps.length, userSkills.length)

  // Strong skills (from UserSkillItem level >= 75 or SkillGap currentLevel >= 75)
  const strongSkills: StrongSkill[] = userSkills.length > 0
    ? userSkills
        .filter((s) => s.level >= 75)
        .map((s) => ({ name: s.skillName, score: s.level }))
    : skillGaps
        .filter((g) => g.currentLevel >= 75)
        .map((g) => ({ name: g.skill, score: g.currentLevel }))

  const strongSkillCount = strongSkills.length

  const improvementCount = skillGaps.filter((g) => g.gap > 0).length

  const readinessLabel =
    overallCurrent >= 85 ? 'Job Ready' :
    overallCurrent >= 70 ? 'Needs Improvement' :
    'Early Stage'

  const readinessVariant: 'success' | 'warning' | 'danger' =
    overallCurrent >= 85 ? 'success' :
    overallCurrent >= 70 ? 'warning' : 'danger'

  const categories: SkillCategory[] = skillGaps.map((g) => ({
    id: g.id,
    name: g.skill,
    current: g.currentLevel,
    target: g.requiredLevel,
  }))

  const byPriority: Record<Priority, string[]> = {
    Critical: [],
    High: [],
    Medium: [],
    Strong: [],
  }

  skillGaps.forEach((g) => {
    const prio = mapPriority(g.priority)
    byPriority[prio].push(g.skill)
  })

  // Add strong skills to Strong priority bucket if empty
  if (byPriority.Strong.length === 0 && strongSkills.length > 0) {
    byPriority.Strong = strongSkills.map((s) => s.name)
  }

  const skillItems: SkillItem[] = skillGaps.map((g) => ({
    id: g.id,
    name: g.skill,
    category: g.skill,
    current: g.currentLevel,
    target: g.requiredLevel,
    gap: g.gap,
    priority: mapPriority(g.priority),
    description: `${g.skill} alignment for target career. Required proficiency target is ${g.requiredLevel}%.`,
    recommendedAction: g.recommendedActions && g.recommendedActions.length > 0
      ? g.recommendedActions[0]
      : `Focus on mastering ${g.skill} concepts and completing target coursework.`,
  }))

  const focusAreas: FocusArea[] = [...skillGaps]
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3)
    .map((g) => ({
      name: g.skill,
      priority: mapPriority(g.priority),
      current: g.currentLevel,
      target: g.requiredLevel,
      gap: g.gap,
    }))

  const topGaps = focusAreas.slice(0, 2).map((a) => a.name)

  const isEmpty = !isLoading && !error && skillGaps.length === 0 && userSkills.length === 0

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">

      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-surface-900">Your Skill Gap</h1>
          <p className="text-sm text-surface-500 mt-1.5 leading-relaxed max-w-xl">
            See where your current skills stand against the requirements for
            your recommended career.
          </p>
        </div>
        {!isLoading && !error && !isEmpty && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={readinessVariant} dot size="md">{readinessLabel}</Badge>
          </div>
        )}
      </div>

      {/* ── Loading State ───────────────────────────────── */}
      {isLoading && (
        <Card padding="lg" className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-600 mb-4 animate-spin">
            <RefreshCw size={24} />
          </div>
          <p className="text-surface-700 font-medium">Loading your skill gap analysis...</p>
          <p className="text-xs text-surface-400 mt-1">Analyzing skill gaps and target levels</p>
        </Card>
      )}

      {/* ── Error State ─────────────────────────────────── */}
      {!isLoading && error && (
        <Card padding="lg" className="border-danger-200 bg-danger-50/50">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-danger-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-danger-900">Unable to load your skill gap analysis.</h3>
              <p className="text-sm text-danger-700 mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 bg-white"
                leftIcon={<RefreshCw size={14} />}
                onClick={fetchData}
              >
                Retry
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Empty State ─────────────────────────────────── */}
      {isEmpty && (
        <Card padding="lg" className="text-center py-12">
          <p className="text-surface-700 font-medium text-base">No skill gap analysis found</p>
          <p className="text-sm text-surface-500 mt-1 max-w-md mx-auto">
            Your profile analysis needs to be completed first before skill gaps can be calculated.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => navigate('/analysis')}
          >
            Go to AI Analysis
          </Button>
        </Card>
      )}

      {/* ── Main Content ────────────────────────────────── */}
      {!isLoading && !error && !isEmpty && (
        <>
          {/* Summary hero */}
          <SummaryCard
            overallCurrent={overallCurrent}
            overallTarget={overallTarget}
            careerTarget={careerTarget}
            skillsEvaluated={skillsEvaluated}
            strongSkillCount={strongSkillCount}
            improvementCount={improvementCount}
          />

          {/* Insight card */}
          <InsightCard topGaps={topGaps} careerTarget={careerTarget} />

          {/* Category grid */}
          <CategoryGrid categories={categories} />

          {/* Priority section */}
          <PrioritySection byPriority={byPriority} />

          {/* Skill detail cards */}
          {skillItems.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-surface-800 mb-3">Skill gap details</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {skillItems.map((skill) => (
                  <SkillDetailCard key={skill.id} skill={skill} />
                ))}
              </div>
            </div>
          )}

          {/* Strong skills */}
          <StrongSkillsSection strongSkills={strongSkills} />

          {/* Focus next */}
          <FocusNextSection focusAreas={focusAreas} />
        </>
      )}

      {/* ── Journey indicator ────────────────────────────── */}
      <div className="pt-4 border-t border-surface-100">
        <p className="text-xs text-surface-400 mb-2 font-medium">Your career journey</p>
        <JourneyIndicator activeStep={4} />
      </div>
    </div>
  )
}
