import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  CheckCircle2,
  Circle,
  Loader2,
  ChevronRight,
  Target,
  Clock,
  Zap,
  TrendingUp,
  BookOpen,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Badge, Button, Progress,
} from '../components/ui'
import { JourneyIndicator } from '../components/JourneyIndicator'
import { useAuth } from '../context/AuthContext'
import {
  getRoadmapApi,
  generateRoadmapApi,
  updateTaskStatusApi,
  type BackendRoadmap,
  type BackendRoadmapTask
} from '../api/roadmap'
import {
  type RoadmapWeek,
  type TaskStatus,
  type Difficulty
} from '../data/roadmapData'

/* ══════════════════════════════════════════════════════════════
   Types & Interfaces
══════════════════════════════════════════════════════════════ */
type FilterOption = 'all' | TaskStatus
type TaskMap = Record<string, boolean>

/* ══════════════════════════════════════════════════════════════
   Helpers & Normalizers
══════════════════════════════════════════════════════════════ */
const difficultyVariant = (d: string): 'default' | 'primary' | 'warning' =>
  d === 'Beginner' ? 'default' : d === 'Intermediate' ? 'primary' : 'warning'

const statusLabel: Record<TaskStatus, string> = {
  'completed': 'Completed',
  'in-progress': 'In Progress',
  'upcoming': 'Upcoming'
}

function deriveStatus(tasks: { id: string; completed: boolean }[], taskMap: TaskMap): TaskStatus {
  const total = tasks.length
  if (total === 0) return 'upcoming'
  const doneCount = tasks.filter((t) => taskMap[t.id] ?? t.completed).length
  if (doneCount === 0) return 'upcoming'
  if (doneCount === total) return 'completed'
  return 'in-progress'
}

function deriveProgress(tasks: { id: string; completed: boolean }[], taskMap: TaskMap): number {
  if (tasks.length === 0) return 0
  const done = tasks.filter((t) => taskMap[t.id] ?? t.completed).length
  return Math.round((done / tasks.length) * 100)
}

function mapPriorityToDifficulty(priority: string): Difficulty {
  const p = priority.toUpperCase()
  if (p === 'CRITICAL' || p === 'HIGH') return 'Advanced'
  if (p === 'LOW') return 'Beginner'
  return 'Intermediate'
}

function parseDurationHours(duration?: string): number {
  if (!duration) return 5
  const match = duration.match(/\d+/)
  if (match) {
    const val = parseInt(match[0], 10)
    return val > 0 ? val : 5
  }
  return 5
}

function mapBackendTasksToWeeks(backendTasks: BackendRoadmapTask[], targetCareer: string): RoadmapWeek[] {
  return backendTasks.map((t, index) => {
    const isDone = t.status === 'COMPLETED'
    const status: TaskStatus = isDone ? 'completed' : t.status === 'IN_PROGRESS' ? 'in-progress' : 'upcoming'
    const skills = t.skill ? t.skill.split(/[,/]/).map((s) => s.trim()) : [targetCareer]
    const difficulty = mapPriorityToDifficulty(t.priority || 'MEDIUM')
    const hours = parseDurationHours(t.duration)

    return {
      id: t.id,
      week: index + 1,
      title: t.title,
      skills,
      estimatedHours: hours,
      difficulty,
      status,
      progress: isDone ? 100 : t.status === 'IN_PROGRESS' ? 50 : 0,
      skillGapReason: t.description || `${t.priority || 'Medium'} priority skill module for ${targetCareer}.`,
      tasks: [
        {
          id: t.id,
          title: t.title,
          skill: t.skill || targetCareer,
          estimatedMinutes: hours * 15 > 0 ? Math.min(hours * 15, 120) : 60,
          completed: isDone
        }
      ]
    }
  })
}

/* ══════════════════════════════════════════════════════════════
   Status Icon
══════════════════════════════════════════════════════════════ */
function StatusIcon({ status, size = 18 }: { status: TaskStatus; size?: number }) {
  if (status === 'completed') return <CheckCircle2 size={size} className="text-success-500" />
  if (status === 'in-progress') return <Loader2 size={size} className="text-brand-500 animate-spin" />
  return <Circle size={size} className="text-surface-300" />
}

/* ══════════════════════════════════════════════════════════════
   Summary Cards Component
══════════════════════════════════════════════════════════════ */
function SummaryCards({
  targetCareer,
  totalWeeks,
  overallProgress,
  prioritySkillsCount,
  focusAreasCount
}: {
  targetCareer: string
  totalWeeks: number
  overallProgress: number
  prioritySkillsCount: number
  focusAreasCount: number
}) {
  return (
    <Card padding="lg" className="bg-gradient-to-br from-brand-50/50 to-white border-brand-100">
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-1">
            Personalized for
          </p>
          <h2 className="text-xl font-bold text-surface-900 mb-1">{targetCareer}</h2>
          <p className="text-sm text-surface-500 mb-4">
            {totalWeeks}-week roadmap · {prioritySkillsCount} priority skills · {focusAreasCount} focus areas
          </p>
          <div className="flex items-center gap-2 mb-1 text-xs text-surface-500">
            <span>Overall progress</span>
            <span className="font-semibold text-brand-600">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} size="md" color="brand" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 flex-shrink-0 sm:w-32">
          {[
            { label: 'Total Weeks', value: `${totalWeeks}w`, color: 'text-surface-700', bg: 'bg-surface-50' },
            { label: 'Progress', value: `${overallProgress}%`, color: 'text-brand-700', bg: 'bg-brand-50' },
            { label: 'Priority Skills', value: String(prioritySkillsCount), color: 'text-warning-700', bg: 'bg-warning-50' },
            { label: 'Focus Areas', value: String(focusAreasCount), color: 'text-info-700', bg: 'bg-info-50' },
          ].map((s) => (
            <div key={s.label} className={clsx('flex flex-col items-center px-3 py-2 rounded-xl border border-surface-100', s.bg)}>
              <span className={clsx('text-xl font-bold leading-none', s.color)}>{s.value}</span>
              <span className="text-xs text-surface-400 text-center mt-0.5 whitespace-nowrap">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Focus This Week Card
══════════════════════════════════════════════════════════════ */
function FocusCard({
  weeks,
  taskMap,
  onCompleteTask,
  updatingTaskId
}: {
  weeks: RoadmapWeek[]
  taskMap: TaskMap
  onCompleteTask: (id: string) => void
  updatingTaskId: string | null
}) {
  const [started, setStarted] = useState(false)

  const focusWeek = weeks.find((w) => {
    const s = deriveStatus(w.tasks, taskMap)
    return s === 'in-progress'
  }) ?? weeks.find((w) => deriveStatus(w.tasks, taskMap) === 'upcoming')

  if (!focusWeek) return null

  const status = deriveStatus(focusWeek.tasks, taskMap)
  const progress = deriveProgress(focusWeek.tasks, taskMap)

  return (
    <Card padding="lg" className="border-brand-200">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-brand-500" />
            <CardTitle>Focus This Week</CardTitle>
          </div>
          <Badge variant="danger" size="sm">Critical</Badge>
        </div>
        <CardDescription className="mt-1">
          <strong className="text-surface-700">{focusWeek.title}</strong>
          {' — '}{focusWeek.skillGapReason}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          <Progress value={progress} size="md" color="brand" label="Week progress" showLabel className="mb-4" />

          <div className="space-y-2">
            {focusWeek.tasks.map((task) => {
              const done = taskMap[task.id] ?? task.completed
              const isUpdating = updatingTaskId === task.id
              return (
                <div key={task.id} className="flex items-center gap-3 py-1.5">
                  <button
                    disabled={isUpdating}
                    onClick={() => onCompleteTask(task.id)}
                    className={clsx(
                      'w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                      done
                        ? 'bg-success-500 border-success-500'
                        : 'border-surface-300 hover:border-brand-400',
                      isUpdating && 'opacity-50 cursor-not-allowed'
                    )}
                    aria-label={done ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
                  >
                    {isUpdating ? (
                      <Loader2 size={10} className="animate-spin text-surface-400" />
                    ) : (
                      done && <CheckCircle2 size={12} className="text-white" />
                    )}
                  </button>
                  <span className={clsx('text-sm flex-1', done ? 'line-through text-surface-400' : 'text-surface-700')}>
                    {task.title}
                  </span>
                  <span className="text-xs text-surface-400 flex-shrink-0">
                    {task.estimatedMinutes}m
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-2 text-xs text-surface-500">
          <Clock size={12} />
          <span>{focusWeek.estimatedHours}h estimated</span>
          <span className="mx-1 text-surface-200">·</span>
          <Badge variant={difficultyVariant(focusWeek.difficulty)} size="sm">{focusWeek.difficulty}</Badge>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="ml-auto"
          onClick={() => setStarted((v) => !v)}
        >
          {started || status === 'in-progress' ? 'Continue' : 'Start Learning'}
        </Button>
      </CardFooter>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Progress Stats Bar
══════════════════════════════════════════════════════════════ */
function ProgressStats({
  weeks,
  taskMap
}: {
  weeks: RoadmapWeek[]
  taskMap: TaskMap
}) {
  const completed = weeks.filter((w) => deriveStatus(w.tasks, taskMap) === 'completed').length
  const inProgress = weeks.filter((w) => deriveStatus(w.tasks, taskMap) === 'in-progress').length
  const upcoming = weeks.filter((w) => deriveStatus(w.tasks, taskMap) === 'upcoming').length

  const allTasks = weeks.flatMap((w) => w.tasks)
  const doneTasks = allTasks.filter((t) => taskMap[t.id] ?? t.completed).length

  return (
    <div className="flex flex-wrap gap-3">
      {[
        { label: 'Completed', value: completed, badge: 'success' as const, icon: <CheckCircle2 size={13} className="text-success-500" /> },
        { label: 'In Progress', value: inProgress, badge: 'primary' as const, icon: <Loader2 size={13} className="text-brand-500" /> },
        { label: 'Upcoming', value: upcoming, badge: 'default' as const, icon: <Circle size={13} className="text-surface-400" /> },
      ].map((s) => (
        <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-surface-200">
          {s.icon}
          <span className="text-sm font-semibold text-surface-800">{s.value}</span>
          <span className="text-xs text-surface-500">{s.label} weeks</span>
        </div>
      ))}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-50 border border-surface-200 ml-auto">
        <BookOpen size={13} className="text-surface-400" />
        <span className="text-sm font-semibold text-surface-800">{doneTasks}</span>
        <span className="text-xs text-surface-500">tasks done</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Week Card
══════════════════════════════════════════════════════════════ */
function WeekCard({
  week,
  taskMap,
  onToggleTask,
  isExpanded,
  onToggleExpand,
  updatingTaskId
}: {
  week: RoadmapWeek
  taskMap: TaskMap
  onToggleTask: (id: string) => void
  isExpanded: boolean
  onToggleExpand: () => void
  updatingTaskId: string | null
}) {
  const status = deriveStatus(week.tasks, taskMap)
  const progress = deriveProgress(week.tasks, taskMap)
  const statusBadgeVariant = status === 'completed' ? 'success' : status === 'in-progress' ? 'primary' : 'default'

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-full bg-white border-2 border-surface-200 flex items-center justify-center flex-shrink-0 z-10">
          <StatusIcon status={status} size={16} />
        </div>
        <div className="flex-1 w-px bg-surface-200 mt-1 min-h-[1.5rem]" />
      </div>

      <Card
        padding="md"
        className={clsx(
          'flex-1 mb-4 cursor-pointer transition-shadow duration-150',
          status === 'completed' && 'border-success-100 bg-success-50/20',
          status === 'in-progress' && 'border-brand-200',
          status === 'upcoming' && 'opacity-80'
        )}
        onClick={onToggleExpand}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold text-surface-400 uppercase tracking-wide">Week {week.week}</span>
              <Badge variant={statusBadgeVariant} size="sm" dot>{statusLabel[status]}</Badge>
              <Badge variant={difficultyVariant(week.difficulty)} size="sm">{week.difficulty}</Badge>
            </div>
            <h3 className="text-sm font-semibold text-surface-900 mb-1">{week.title}</h3>
            <p className="text-xs text-surface-500 mb-2">{week.skillGapReason}</p>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {week.skills.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-surface-100 border border-surface-200 text-surface-600 text-xs rounded-full">{s}</span>
              ))}
            </div>

            <Progress
              value={progress}
              size="xs"
              color={status === 'completed' ? 'success' : 'brand'}
              className="mb-1.5"
            />
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0 text-xs text-surface-400">
            <span className="flex items-center gap-1"><Clock size={11} />{week.estimatedHours}h</span>
            <span className="font-semibold text-surface-600">{progress}%</span>
            <ChevronRight
              size={14}
              className={clsx('transition-transform duration-200', isExpanded && 'rotate-90')}
            />
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-surface-100 space-y-2" onClick={(e) => e.stopPropagation()}>
            {week.tasks.map((task) => {
              const done = taskMap[task.id] ?? task.completed
              const isUpdating = updatingTaskId === task.id
              return (
                <div key={task.id} className="flex items-center gap-3 py-1">
                  <button
                    disabled={isUpdating}
                    onClick={() => onToggleTask(task.id)}
                    className={clsx(
                      'w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                      done
                        ? 'bg-success-500 border-success-500'
                        : 'border-surface-300 hover:border-brand-400 hover:bg-brand-50',
                      isUpdating && 'opacity-50 cursor-not-allowed'
                    )}
                    aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {isUpdating ? (
                      <Loader2 size={10} className="animate-spin text-surface-400" />
                    ) : (
                      done && <CheckCircle2 size={12} className="text-white" />
                    )}
                  </button>
                  <span className={clsx('text-xs flex-1', done ? 'line-through text-surface-400' : 'text-surface-700')}>
                    {task.title}
                  </span>
                  <span className="text-xs text-surface-400 flex-shrink-0">{task.skill}</span>
                  <span className="text-xs text-surface-400 flex-shrink-0">{task.estimatedMinutes}m</span>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Top Priorities Section
══════════════════════════════════════════════════════════════ */
function TopPrioritiesSection({ tasks }: { tasks: BackendRoadmapTask[] }) {
  const topSkills = useMemo(() => {
    const priorityItems = tasks.filter((t) => t.priority === 'CRITICAL' || t.priority === 'HIGH')
    const sourceItems = priorityItems.length > 0 ? priorityItems : tasks.slice(0, 3)

    return sourceItems.slice(0, 3).map((t, index) => {
      const isCritical = t.priority === 'CRITICAL'
      return {
        name: t.skill || t.title,
        current: isCritical ? 20 : 35 + index * 10,
        target: isCritical ? 65 : 75 + index * 5,
        gap: isCritical ? 45 : 30 + index * 5
      }
    })
  }, [tasks])

  if (topSkills.length === 0) return null

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-brand-500" />
          <CardTitle>Top skills you&apos;re building</CardTitle>
        </div>
        <CardDescription className="mt-0.5">Based on your Skill Gap analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-5">
          {topSkills.map((p, i) => (
            <div key={p.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-surface-100 text-surface-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-surface-800">{p.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-surface-500">
                  <span className="text-warning-600 font-medium">{p.gap}pt gap</span>
                  <span>{p.current}% → {p.target}%</span>
                </div>
              </div>
              <div className="relative h-2 rounded-full bg-surface-100 overflow-visible">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-surface-400 z-10 rounded-full"
                  style={{ left: `${p.target}%` }}
                  aria-label={`Target ${p.target}%`}
                />
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-700"
                  style={{ width: `${p.current}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main RoadmapPage Component
══════════════════════════════════════════════════════════════ */
export function RoadmapPage() {
  const navigate = useNavigate()
  const { token } = useAuth()

  const [roadmap, setRoadmap] = useState<BackendRoadmap | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const [taskMap, setTaskMap] = useState<TaskMap>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState<FilterOption>('all')

  const fetchRoadmap = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    setError(null)
    setUpdateError(null)

    try {
      let data = await getRoadmapApi(token)
      if (!data || !data.tasks || data.tasks.length === 0) {
        data = await generateRoadmapApi(token)
      }
      setRoadmap(data)

      const initialMap: TaskMap = {}
      data.tasks.forEach((t) => {
        initialMap[t.id] = t.status === 'COMPLETED'
      })
      setTaskMap(initialMap)

      // Default expand the first in-progress or upcoming week
      if (data.tasks.length > 0) {
        const activeItem = data.tasks.find((t) => t.status === 'IN_PROGRESS') || data.tasks[0]
        setExpanded({ [activeItem.id]: true })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load your roadmap.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchRoadmap()
  }, [fetchRoadmap])

  // Normalization into RoadmapWeek[]
  const targetCareer = roadmap?.targetCareer || sessionStorage.getItem('cc_careerGoal') || 'Software Developer'
  const weeks = useMemo(() => {
    if (!roadmap?.tasks) return []
    return mapBackendTasksToWeeks(roadmap.tasks, targetCareer)
  }, [roadmap, targetCareer])

  const allTasks = useMemo(() => weeks.flatMap((w) => w.tasks), [weeks])
  const totalTasks = allTasks.length
  const completedTasks = useMemo(
    () => allTasks.filter((t) => taskMap[t.id] ?? t.completed).length,
    [allTasks, taskMap]
  )
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const prioritySkillsCount = useMemo(() => {
    if (!roadmap?.tasks) return 0
    return new Set(roadmap.tasks.map((t) => t.skill).filter(Boolean)).size
  }, [roadmap])

  const focusAreasCount = useMemo(() => {
    if (!roadmap?.tasks) return 0
    return roadmap.tasks.filter((t) => t.priority === 'CRITICAL' || t.priority === 'HIGH').length
  }, [roadmap])

  const filteredWeeks = useMemo(() => {
    if (filter === 'all') return weeks
    return weeks.filter((w) => deriveStatus(w.tasks, taskMap) === filter)
  }, [filter, weeks, taskMap])

  /* ── Task Toggle Handler with Optimistic Update & Rollback ───────────────── */
  async function toggleTask(taskId: string) {
    if (!token || updatingTaskId) return

    const currentCompleted = taskMap[taskId] ?? false
    const newCompleted = !currentCompleted
    const newBackendStatus: 'COMPLETED' | 'NOT_STARTED' = newCompleted ? 'COMPLETED' : 'NOT_STARTED'

    // 1. Optimistic update
    setTaskMap((prev) => ({ ...prev, [taskId]: newCompleted }))
    setUpdatingTaskId(taskId)
    setUpdateError(null)

    try {
      // 2. Call backend
      const updatedTask = await updateTaskStatusApi(token, taskId, newBackendStatus)

      // 3. Reconcile with local state
      setTaskMap((prev) => ({ ...prev, [taskId]: updatedTask.status === 'COMPLETED' }))
      setRoadmap((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, status: updatedTask.status } : t))
        }
      })
    } catch (err: unknown) {
      // 4. Rollback on failure
      setTaskMap((prev) => ({ ...prev, [taskId]: currentCompleted }))
      setUpdateError('Failed to update task status. Please try again.')
    } finally {
      setUpdatingTaskId(null)
    }
  }

  function toggleExpand(weekId: string) {
    setExpanded((prev) => ({ ...prev, [weekId]: !prev[weekId] }))
  }

  const FILTERS: { id: FilterOption; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'completed', label: 'Completed' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'upcoming', label: 'Upcoming' },
  ]

  /* ── Render Loading State ──────────────────────────────── */
  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-surface-900">Your Personalized Roadmap</h1>
            <p className="text-sm text-surface-500 mt-1.5">Generating your customized learning plan...</p>
          </div>
        </div>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <RefreshCw size={36} className="text-brand-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-surface-900 mb-1">Building Your Roadmap</h3>
            <p className="text-sm text-surface-500 max-w-md">
              Analysing your career goals and skill gap insights to craft a week-by-week action plan...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  /* ── Render Error State ────────────────────────────────── */
  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-surface-900">Your Personalized Roadmap</h1>
          </div>
        </div>
        <Card padding="lg" className="border-danger-200 bg-danger-50/20">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle size={40} className="text-danger-500 mb-3" />
            <h3 className="text-lg font-semibold text-surface-900 mb-1">Unable to load your roadmap</h3>
            <p className="text-sm text-surface-600 max-w-md mb-6">{error}</p>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={fetchRoadmap}
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  /* ── Render Empty State ────────────────────────────────── */
  if (!roadmap || !roadmap.tasks || roadmap.tasks.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-surface-900">Your Personalized Roadmap</h1>
          </div>
        </div>
        <Card padding="lg" className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <Target size={40} className="text-brand-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-surface-900">No Roadmap Available</h3>
            <p className="text-sm text-surface-500">
              Please complete your profile career analysis and skill gap analysis to generate a personalized roadmap.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/skill-gap')}
            >
              Back to Skill Gap
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  /* ── Render Main Content ───────────────────────────────── */
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-surface-900">Your Personalized Roadmap</h1>
          <p className="text-sm text-surface-500 mt-1.5 leading-relaxed">
            Your learning plan is built around the skills you need most for your target career.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="primary" dot size="md">
            {targetCareer}
          </Badge>
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

      {/* ── Summary Card ─────────────────────────────────── */}
      <SummaryCards
        targetCareer={targetCareer}
        totalWeeks={weeks.length}
        overallProgress={overallProgress}
        prioritySkillsCount={prioritySkillsCount}
        focusAreasCount={focusAreasCount}
      />

      {/* ── Focus This Week ──────────────────────────────── */}
      <FocusCard
        weeks={weeks}
        taskMap={taskMap}
        onCompleteTask={toggleTask}
        updatingTaskId={updatingTaskId}
      />

      {/* ── Top Priorities ───────────────────────────────── */}
      <TopPrioritiesSection tasks={roadmap.tasks} />

      {/* ── Progress Stats ───────────────────────────────── */}
      <ProgressStats weeks={weeks} taskMap={taskMap} />

      {/* ── Filter Row ───────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Target size={15} className="text-surface-400" />
          <span className="text-sm font-semibold text-surface-700 mr-1">{weeks.length}-Week Timeline</span>
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

        {/* ── Timeline Weeks ──────────────────────────────── */}
        {filteredWeeks.length === 0 ? (
          <div className="text-center py-12 text-surface-400">
            <p className="text-sm">No weeks match this filter.</p>
          </div>
        ) : (
          <div>
            {filteredWeeks.map((week) => (
              <WeekCard
                key={week.id}
                week={week}
                taskMap={taskMap}
                onToggleTask={toggleTask}
                isExpanded={!!expanded[week.id]}
                onToggleExpand={() => toggleExpand(week.id)}
                updatingTaskId={updatingTaskId}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Next Step CTA ────────────────────────────────── */}
      <Card padding="md" className="border-brand-100 bg-brand-50/30 text-center">
        <p className="text-sm text-surface-700 font-medium mb-1">Ready to start learning?</p>
        <p className="text-xs text-surface-500 mb-3">
          Explore IBM SkillsBuild courses matched to your roadmap skill gaps.
        </p>
        <Button
          variant="primary"
          size="sm"
          rightIcon={<ChevronRight size={14} />}
          onClick={() => navigate('/courses')}
        >
          View Recommended Courses
        </Button>
      </Card>

      {/* ── Journey Indicator ────────────────────────────── */}
      <div className="pt-4 border-t border-surface-100">
        <p className="text-xs text-surface-400 mb-2 font-medium">Your career journey</p>
        <JourneyIndicator activeStep={5} />
      </div>
    </div>
  )
}
