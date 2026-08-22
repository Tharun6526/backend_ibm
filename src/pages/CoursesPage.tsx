import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  CheckCircle2,
  Clock,
  ChevronRight,
  BookOpen,
  PlayCircle,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react'
import {
  Card,
  Badge, Button, Progress,
} from '../components/ui'
import { JourneyIndicator } from '../components/JourneyIndicator'
import { useAuth } from '../context/AuthContext'
import {
  getCoursesApi,
  getRecommendedCoursesApi,
  updateCourseProgressApi,
  type BackendCourse
} from '../api/course'

/* ══════════════════════════════════════════════════════════════
   Types
══════════════════════════════════════════════════════════════ */
type CourseStatus = 'not-started' | 'in-progress' | 'completed'
type FilterOption = 'all' | 'recommended' | 'in-progress' | 'completed'
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

interface Course {
  id: string
  title: string
  provider: string
  skill: string
  difficulty: Difficulty
  durationHours: number
  gapReason: string
  roadmapWeek: number
  roadmapTitle: string
  recommended: boolean
  externalUrl?: string
}

interface CourseState {
  status: CourseStatus
  progress: number // 0-100
}

/* ══════════════════════════════════════════════════════════════
   Helpers & Normalizers
══════════════════════════════════════════════════════════════ */
const diffVariant = (d: Difficulty): 'default' | 'primary' | 'warning' =>
  d === 'Beginner' ? 'default' : d === 'Intermediate' ? 'primary' : 'warning'

function mapDifficulty(diff?: string): Difficulty {
  if (!diff) return 'Intermediate'
  const d = diff.toLowerCase()
  if (d.includes('begin')) return 'Beginner'
  if (d.includes('adv')) return 'Advanced'
  return 'Intermediate'
}

function parseDurationHours(duration?: string): number {
  if (!duration) return 8
  const match = duration.match(/\d+/)
  if (match) {
    const val = parseInt(match[0], 10)
    return val > 0 ? val : 8
  }
  return 8
}

function deriveStatus(userProgress: number, completionStatus: boolean): CourseStatus {
  if (completionStatus || userProgress >= 100) return 'completed'
  if (userProgress > 0) return 'in-progress'
  return 'not-started'
}

function normalizeBackendCourse(
  c: BackendCourse,
  index: number,
  recommendedSet: Set<string>
): Course {
  const isRec = recommendedSet.has(c.id)
  return {
    id: c.id,
    title: c.courseName,
    provider: c.provider || 'IBM SkillsBuild',
    skill: c.skillName,
    difficulty: mapDifficulty(c.difficulty),
    durationHours: parseDurationHours(c.duration),
    gapReason: c.description || `${c.skillName} course targeted for your career skill gap.`,
    roadmapWeek: index + 1,
    roadmapTitle: `${c.skillName} Fundamentals`,
    recommended: isRec,
    externalUrl: c.externalUrl
  }
}

/* ══════════════════════════════════════════════════════════════
   Single Course Card Component
══════════════════════════════════════════════════════════════ */
function CourseCard({
  course,
  state,
  onStart,
  onContinue,
  onComplete,
  isUpdating
}: {
  course: Course
  state: CourseState
  onStart: () => void
  onContinue: () => void
  onComplete: () => void
  isUpdating: boolean
}) {
  const navigate = useNavigate()
  const { status, progress } = state

  const statusBadgeVariant =
    status === 'completed' ? 'success' :
    status === 'in-progress' ? 'primary' : 'default'

  const statusLabel =
    status === 'completed' ? 'Completed' :
    status === 'in-progress' ? 'In Progress' : 'Not Started'

  return (
    <Card padding="lg" className={clsx(
      'flex flex-col transition-shadow duration-150',
      status === 'completed' && 'border-success-100 bg-success-50/20',
      status === 'in-progress' && 'border-brand-200',
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
          {status === 'completed'
            ? <CheckCircle2 size={18} className="text-success-500" />
            : <BookOpen size={18} className="text-brand-500" />
          }
        </div>
        <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
          <Badge variant={statusBadgeVariant} size="sm" dot>{statusLabel}</Badge>
          {course.recommended && <Badge variant="accent" size="sm">Recommended</Badge>}
        </div>
      </div>

      {/* Title + meta */}
      <h3 className="text-sm font-semibold text-surface-900 mb-1">{course.title}</h3>
      <p className="text-xs text-surface-400 mb-3">{course.provider}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="default" size="sm">{course.skill}</Badge>
        <Badge variant={diffVariant(course.difficulty)} size="sm">{course.difficulty}</Badge>
        <span className="flex items-center gap-1 text-xs text-surface-400">
          <Clock size={11} />{course.durationHours}h
        </span>
      </div>

      {/* Why recommended */}
      <div className="flex-1">
        <p className="text-xs text-surface-400 font-medium mb-0.5">Recommended because…</p>
        <p className="text-xs text-surface-600 leading-relaxed mb-3">{course.gapReason}</p>
      </div>

      {/* Roadmap connection */}
      <div className="flex items-center justify-between bg-surface-50 border border-surface-100 rounded-xl px-3 py-2 mb-3 text-xs">
        <div className="min-w-0">
          <p className="text-surface-400 font-medium">From your roadmap</p>
          <p className="text-surface-700 font-medium truncate">Week {course.roadmapWeek} — {course.roadmapTitle}</p>
        </div>
        <Button
          variant="ghost"
          size="xs"
          rightIcon={<ChevronRight size={11} />}
          onClick={() => navigate('/roadmap')}
          className="flex-shrink-0 ml-2"
        >
          View
        </Button>
      </div>

      {/* Progress bar */}
      {status !== 'not-started' && (
        <Progress
          value={progress}
          size="sm"
          color={status === 'completed' ? 'success' : 'brand'}
          label="Progress"
          showLabel
          className="mb-3"
        />
      )}

      {/* CTA */}
      <div className="mt-auto">
        {status === 'not-started' && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            leftIcon={isUpdating ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
            disabled={isUpdating}
            onClick={onStart}
          >
            Start Course
          </Button>
        )}
        {status === 'in-progress' && (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              leftIcon={isUpdating ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
              disabled={isUpdating}
              onClick={onContinue}
            >
              Continue
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={isUpdating}
              onClick={onComplete}
              aria-label="Mark complete"
            >
              {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            </Button>
          </div>
        )}
        {status === 'completed' && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-success-600 font-medium flex items-center gap-1">
              <CheckCircle2 size={13} /> Course completed
            </span>
            <button
              disabled={isUpdating}
              onClick={onStart}
              className="text-xs text-surface-400 hover:text-surface-600 flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-400 rounded disabled:opacity-50"
              aria-label="Restart course"
            >
              <RotateCcw size={11} /> Restart
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main CoursesPage Component
══════════════════════════════════════════════════════════════ */
export function CoursesPage() {
  const navigate = useNavigate()
  const { token } = useAuth()

  const careerTarget = sessionStorage.getItem('cc_careerGoal') || 'Software Developer'

  const [rawCourses, setRawCourses] = useState<BackendCourse[]>([])
  const [recommendedSet, setRecommendedSet] = useState<Set<string>>(new Set())
  const [states, setStates] = useState<Record<string, CourseState>>({})

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingCourseId, setUpdatingCourseId] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const [filter, setFilter] = useState<FilterOption>('all')

  const fetchCoursesData = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    setError(null)
    setUpdateError(null)

    try {
      const [allRes, recRes] = await Promise.all([
        getCoursesApi(token),
        getRecommendedCoursesApi(token).catch(() => [])
      ])

      setRawCourses(allRes)

      const recIds = new Set(recRes.map((r) => r.id))
      setRecommendedSet(recIds)

      const initialStates: Record<string, CourseState> = {}
      allRes.forEach((c) => {
        const status = deriveStatus(c.userProgress, c.completionStatus)
        initialStates[c.id] = {
          status,
          progress: c.userProgress
        }
      })
      setStates(initialStates)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load courses.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchCoursesData()
  }, [fetchCoursesData])

  const courses: Course[] = useMemo(() => {
    return rawCourses.map((c, index) => normalizeBackendCourse(c, index, recommendedSet))
  }, [rawCourses, recommendedSet])

  /* ── Derived Summaries ─────────────────────────────────────── */
  const completedCount = useMemo(
    () => Object.values(states).filter((s) => s.status === 'completed').length,
    [states]
  )
  const inProgressCount = useMemo(
    () => Object.values(states).filter((s) => s.status === 'in-progress').length,
    [states]
  )
  const totalCourses = courses.length
  const overallProgress = totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0

  const filtered = useMemo(() => {
    if (filter === 'all') return courses
    if (filter === 'recommended') return courses.filter((c) => c.recommended)
    if (filter === 'in-progress') return courses.filter((c) => states[c.id]?.status === 'in-progress')
    if (filter === 'completed') return courses.filter((c) => states[c.id]?.status === 'completed')
    return courses
  }, [filter, courses, states])

  /* ── Progress Update Handler with Optimistic Update & Rollback ── */
  async function updateProgress(courseId: string, targetProgress: number) {
    if (!token || updatingCourseId) return

    const prevState = states[courseId] || { status: 'not-started', progress: 0 }
    const newStatus: CourseStatus = deriveStatus(targetProgress, targetProgress === 100)

    // 1. Optimistic update
    setStates((prev) => ({
      ...prev,
      [courseId]: { status: newStatus, progress: targetProgress }
    }))
    setUpdatingCourseId(courseId)
    setUpdateError(null)

    try {
      // 2. Send API request
      const updated = await updateCourseProgressApi(token, courseId, targetProgress)

      // 3. Reconcile returned state
      const reconciledStatus = deriveStatus(updated.progress, updated.completionStatus)
      setStates((prev) => ({
        ...prev,
        [courseId]: { status: reconciledStatus, progress: updated.progress }
      }))
    } catch (err: unknown) {
      // 4. Rollback on failure
      setStates((prev) => ({
        ...prev,
        [courseId]: prevState
      }))
      setUpdateError('Failed to update course progress. Please try again.')
    } finally {
      setUpdatingCourseId(null)
    }
  }

  function startCourse(id: string) {
    updateProgress(id, 10)
  }

  function continueCourse(id: string) {
    const cur = states[id]?.progress || 0
    const next = Math.min(cur + 25, 90)
    updateProgress(id, next)
  }

  function completeCourse(id: string) {
    updateProgress(id, 100)
  }

  const FILTERS: { id: FilterOption; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'recommended', label: 'Recommended' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ]

  /* ── Render Loading State ──────────────────────────────── */
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-surface-900">Recommended Courses</h1>
            <p className="text-sm text-surface-500 mt-1.5">Loading your recommended learning courses...</p>
          </div>
        </div>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <RefreshCw size={36} className="text-brand-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-surface-900 mb-1">Loading Catalog</h3>
            <p className="text-sm text-surface-500 max-w-md">
              Fetching available and recommended courses tailored to your skill gaps...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  /* ── Render Error State ────────────────────────────────── */
  if (error) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-surface-900">Recommended Courses</h1>
          </div>
        </div>
        <Card padding="lg" className="border-danger-200 bg-danger-50/20">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle size={40} className="text-danger-500 mb-3" />
            <h3 className="text-lg font-semibold text-surface-900 mb-1">Unable to load courses</h3>
            <p className="text-sm text-surface-600 max-w-md mb-6">{error}</p>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={fetchCoursesData}
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  /* ── Render Empty State ────────────────────────────────── */
  if (courses.length === 0) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-surface-900">Recommended Courses</h1>
          </div>
        </div>
        <Card padding="lg" className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <BookOpen size={40} className="text-brand-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-surface-900">No courses are available yet.</h3>
            <p className="text-sm text-surface-500">
              Check back soon for new learning modules aligned with your target career path.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/roadmap')}
            >
              View Roadmap
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  /* ── Render Main Content ───────────────────────────────── */
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-surface-900">Recommended Courses</h1>
          <p className="text-sm text-surface-500 mt-1.5 leading-relaxed">
            Courses selected to help you close the most important skill gaps in your career roadmap.
          </p>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
          <Badge variant="primary" dot size="md">{careerTarget}</Badge>
          <span className="text-xs text-surface-400">
            {courses.filter((c) => c.recommended).length} recommended for you
          </span>
        </div>
      </div>

      {/* Update Error Toast / Banner */}
      {updateError && (
        <div className="p-3 bg-danger-50 border border-danger-200 text-danger-700 text-xs rounded-xl flex items-center justify-between">
          <span>{updateError}</span>
          <button
            onClick={() => setUpdateError(null)}
            className="text-danger-500 font-bold hover:text-danger-800"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Overall progress card ────────────────────────── */}
      <Card padding="md" className="border-brand-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 text-xs text-surface-500">
              <span>Course progress</span>
              <span className="font-semibold text-brand-600">{overallProgress}%</span>
              <span className="text-surface-300">·</span>
              <span>{completedCount} completed</span>
              {inProgressCount > 0 && <><span className="text-surface-300">·</span><span>{inProgressCount} in progress</span></>}
            </div>
            <Progress value={overallProgress} size="md" color="brand" />
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {[
              { label: `${completedCount}`, sub: 'Completed', color: 'text-success-700', bg: 'bg-success-50' },
              { label: `${inProgressCount}`, sub: 'In Progress', color: 'text-brand-700', bg: 'bg-brand-50' },
              { label: `${totalCourses - completedCount - inProgressCount}`, sub: 'Not Started', color: 'text-surface-600', bg: 'bg-surface-50' },
            ].map((s) => (
              <div key={s.sub} className={clsx('flex flex-col items-center px-3 py-2 rounded-xl border border-surface-100 min-w-[4rem]', s.bg)}>
                <span className={clsx('text-lg font-bold leading-none', s.color)}>{s.label}</span>
                <span className="text-xs text-surface-400 mt-0.5 whitespace-nowrap">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Filter row ───────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <BookOpen size={14} className="text-surface-400" />
        <span className="text-sm font-medium text-surface-600 mr-1">
          {filtered.length} {filtered.length === 1 ? 'course' : 'courses'}
        </span>
        <div className="flex gap-1.5 flex-wrap ml-auto">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                filter === f.id
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
              )}
              aria-pressed={filter === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Course grid ──────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-surface-400">
          <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No courses match this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              state={states[course.id] || { status: 'not-started', progress: 0 }}
              onStart={() => startCourse(course.id)}
              onContinue={() => continueCourse(course.id)}
              onComplete={() => completeCourse(course.id)}
              isUpdating={updatingCourseId === course.id}
            />
          ))}
        </div>
      )}

      {/* ── Journey indicator ────────────────────────────── */}
      <div className="pt-4 border-t border-surface-100">
        <p className="text-xs text-surface-400 mb-2 font-medium font-sans">Your career journey</p>
        <JourneyIndicator activeStep={6} />
      </div>
    </div>
  )
}
