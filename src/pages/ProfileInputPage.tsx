import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  Zap,
  UploadCloud,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  RefreshCw,
  Trash2,
  Star,
  GitBranch,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { Button, Card, Badge, Progress, Input } from '../components/ui'
import { JourneyIndicator } from '../components/JourneyIndicator'
import { useAuth } from '../context/AuthContext'
import { uploadResumeApi, getLatestResumeApi } from '../api/resume'
import {
  connectGithubApi,
  getGithubProfileApi,
  extractGithubUsername,
  GithubProfileData,
} from '../api/github'

// Inline GitHub mark — not in this version of lucide-react
function GithubIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════════
   Types
══════════════════════════════════════════════════════════════ */
type ResumeState = 'empty' | 'uploading' | 'uploaded' | 'invalid' | 'error'
type GitHubState = 'disconnected' | 'connecting' | 'connected'

const ACCEPTED_TYPES  = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ACCEPTED_EXT    = ['.pdf', '.docx']
const MAX_BYTES       = 10 * 1024 * 1024 // 10 MB (matching backend limit)

/* ══════════════════════════════════════════════════════════════
   Helpers
══════════════════════════════════════════════════════════════ */
function formatBytes(bytes: number) {
  if (bytes <= 0)          return ''
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isValidGithubUrl(url: string) {
  const trimmed = url.trim()
  if (!trimmed) return false
  if (/^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/?$/.test(trimmed)) return true
  // Allow plain username input
  return /^[A-Za-z0-9_.-]+$/.test(trimmed)
}

/* ══════════════════════════════════════════════════════════════
   Profile summary card
══════════════════════════════════════════════════════════════ */
interface ProfileSummaryProps {
  resumeName:  string
  githubUser:  string
  onAnalyze:   () => void
  canAnalyze:  boolean
}

function ProfileSummaryCard({ resumeName, githubUser, onAnalyze, canAnalyze }: ProfileSummaryProps) {
  // Pull whatever was stored from onboarding (graceful fallback to defaults)
  const goal        = sessionStorage.getItem('cc_careerGoal')       || 'Software Developer'
  const experience  = sessionStorage.getItem('cc_experienceLevel')  || 'Student / Beginner'
  const rawInterests = sessionStorage.getItem('cc_interests')
  const interests: string[] = rawInterests ? (JSON.parse(rawInterests) as string[]) : ['AI / ML', 'Web Development', 'Backend']

  return (
    <Card padding="lg" className="border-brand-200 bg-brand-50/30">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-success-50 border border-success-200 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={16} className="text-success-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-surface-900">Your profile is ready for analysis</h3>
          <p className="text-xs text-surface-500 mt-0.5">All required information has been collected.</p>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2 mb-5">
        {[
          { label: 'Career preferences', detail: `${goal} · ${experience}` },
          { label: 'Resume',             detail: resumeName                  },
          { label: 'GitHub',             detail: `@${githubUser}`            },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2.5 text-sm">
            <CheckCircle2 size={14} className="text-success-500 flex-shrink-0" />
            <span className="font-medium text-surface-700 min-w-[7rem]">{item.label}</span>
            <span className="text-surface-500 truncate text-xs">{item.detail}</span>
          </div>
        ))}
      </div>

      {/* Profile completeness */}
      <Progress
        value={100}
        label="Profile completeness"
        showLabel
        color="success"
        size="md"
        className="mb-5"
      />

      {/* Quick data pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="default" size="sm">{goal}</Badge>
        <Badge variant="default" size="sm">{experience}</Badge>
        {interests.slice(0, 3).map((i) => (
          <Badge key={i} variant="primary" size="sm">{i}</Badge>
        ))}
        {interests.length > 3 && (
          <Badge variant="default" size="sm">+{interests.length - 3} more</Badge>
        )}
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={!canAnalyze}
        rightIcon={<ChevronRight size={17} />}
        onClick={onAnalyze}
      >
        Analyze My Profile
      </Button>

      {!canAnalyze && (
        <p className="text-xs text-surface-400 text-center mt-2">
          Complete resume upload and GitHub connection to enable analysis.
        </p>
      )}
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Resume upload card
══════════════════════════════════════════════════════════════ */
interface ResumeCardProps {
  state:         ResumeState
  fileName:      string
  fileSize:      number
  uploadPct:     number
  invalidReason: string
  errorMsg?:     string
  onFile:        (file: File) => void
  onReplace:     () => void
  onRemove:      () => void
}

function ResumeCard({
  state, fileName, fileSize, uploadPct, invalidReason, errorMsg,
  onFile, onReplace, onRemove,
}: ResumeCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function processFile(file: File) {
    const okType = ACCEPTED_TYPES.includes(file.type) ||
      ACCEPTED_EXT.some(ext => file.name.toLowerCase().endsWith(ext))
    if (!okType) { onFile(new File([], file.name, { type: '__invalid_type__' })); return }
    if (file.size > MAX_BYTES) { onFile(new File([], file.name, { type: '__too_large__' })); return }
    onFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  return (
    <Card padding="lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
          <FileText size={16} className="text-brand-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-surface-900">Upload your resume</h3>
          <p className="text-xs text-surface-500">PDF or DOCX · Maximum 10 MB</p>
        </div>
        {state === 'uploaded' && (
          <Badge variant="success" dot size="sm" className="ml-auto">Uploaded</Badge>
        )}
        {(state === 'invalid' || state === 'error') && (
          <Badge variant="danger" size="sm" className="ml-auto">Failed</Badge>
        )}
      </div>

      {/* ── EMPTY / DRAG DROP ── */}
      {state === 'empty' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={clsx(
            'rounded-xl border-2 border-dashed flex flex-col items-center justify-center',
            'py-10 px-6 text-center transition-colors duration-150 cursor-pointer',
            dragging
              ? 'border-brand-400 bg-brand-50'
              : 'border-surface-200 bg-surface-50 hover:border-brand-300 hover:bg-brand-50/40'
          )}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload resume — click or drag and drop"
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <UploadCloud
            size={36}
            className={clsx('mb-3', dragging ? 'text-brand-500' : 'text-surface-300')}
          />
          <p className="text-sm font-medium text-surface-700 mb-1">
            {dragging ? 'Drop your file here' : 'Drag and drop your resume here or browse'}
          </p>
          <p className="text-xs text-surface-400 mb-4">Supported: PDF, DOCX</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
          >
            Choose File
          </Button>
        </div>
      )}

      {/* ── UPLOADING ── */}
      {state === 'uploading' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
              <FileText size={15} className="text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-800 truncate">{fileName}</p>
              {fileSize > 0 && <p className="text-xs text-surface-500">{formatBytes(fileSize)}</p>}
            </div>
            <span className="text-xs font-semibold text-brand-600 flex-shrink-0">{uploadPct}%</span>
          </div>
          <Progress
            value={uploadPct}
            size="sm"
            color="brand"
            animated
            label="Uploading…"
          />
        </div>
      )}

      {/* ── UPLOADED ── */}
      {state === 'uploaded' && (
        <div className="flex items-center gap-3 p-3 bg-success-50 border border-success-100 rounded-xl">
          <CheckCircle2 size={18} className="text-success-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-800 truncate">{fileName}</p>
            {fileSize > 0 && <p className="text-xs text-surface-500">{formatBytes(fileSize)}</p>}
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <Button
              variant="ghost"
              size="xs"
              leftIcon={<RefreshCw size={12} />}
              onClick={onReplace}
            >
              Replace
            </Button>
            <Button
              variant="ghost"
              size="xs"
              leftIcon={<Trash2 size={12} />}
              onClick={onRemove}
              className="text-danger-600 hover:bg-danger-50"
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* ── INVALID ── */}
      {state === 'invalid' && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-danger-50 border border-danger-100 rounded-xl">
            <AlertCircle size={16} className="text-danger-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-danger-700">{invalidReason}</p>
              <p className="text-xs text-danger-600 mt-0.5">Please choose a valid PDF or DOCX under 10 MB.</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<UploadCloud size={13} />}
            onClick={() => inputRef.current?.click()}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* ── ERROR ── */}
      {state === 'error' && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-danger-50 border border-danger-100 rounded-xl">
            <XCircle size={16} className="text-danger-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-danger-700">
                {errorMsg || 'Something went wrong uploading your resume. Please try again.'}
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            Retry Upload
          </Button>
        </div>
      )}

      {/* Hidden file input — always in DOM */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Upload resume file"
      />
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   GitHub connection card
══════════════════════════════════════════════════════════════ */
interface GitHubCardProps {
  state:         GitHubState
  githubUrl:     string
  urlError:      string
  githubData:    GithubProfileData | null
  onUrlChange:   (val: string) => void
  onConnect:     () => void
  onDisconnect:  () => void
}

function GitHubCard({
  state, githubUrl, urlError, githubData, onUrlChange, onConnect, onDisconnect,
}: GitHubCardProps) {
  const username = githubData?.username || extractGithubUsername(githubUrl) || 'user'
  const repos = githubData?.repositories || []

  return (
    <Card padding="lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-surface-900 flex items-center justify-center flex-shrink-0">
          <GithubIcon size={16} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-surface-900">Connect your GitHub</h3>
          <p className="text-xs text-surface-500">
            Let Career Copilot understand your coding projects,<br className="hidden sm:block" />
            repositories and technical experience.
          </p>
        </div>
        {state === 'connected' && (
          <Badge variant="success" dot size="sm" className="ml-auto flex-shrink-0">Connected</Badge>
        )}
      </div>

      {/* ── DISCONNECTED ── */}
      {state === 'disconnected' && (
        <div className="space-y-3">
          <Input
            label="GitHub Profile URL or Username"
            placeholder="https://github.com/username or username"
            value={githubUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            error={urlError}
            fullWidth
            leftIcon={<GithubIcon size={14} />}
            type="url"
            autoComplete="url"
          />
          <Button
            variant="primary"
            size="md"
            leftIcon={<GithubIcon size={15} />}
            onClick={onConnect}
            disabled={!githubUrl.trim() || !!urlError}
            fullWidth
          >
            Connect GitHub
          </Button>
        </div>
      )}

      {/* ── CONNECTING ── */}
      {state === 'connecting' && (
        <div className="flex items-center justify-center py-8 gap-3 text-surface-500">
          <Loader2 size={20} className="animate-spin text-brand-500" />
          <span className="text-sm">Connecting to GitHub…</span>
        </div>
      )}

      {/* ── CONNECTED ── */}
      {state === 'connected' && (
        <div className="space-y-4">
          {/* User row */}
          <div className="flex items-center gap-3 p-3 bg-success-50 border border-success-100 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-surface-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {githubData?.avatarUrl ? (
                <img src={githubData.avatarUrl} alt={username} className="w-full h-full object-cover" />
              ) : (
                <GithubIcon size={16} className="text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-900">@{username}</p>
              <p className="text-xs text-surface-500">GitHub profile connected</p>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={onDisconnect}
              className="text-surface-500 flex-shrink-0"
            >
              Disconnect
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Repos',         value: githubData?.publicRepos ?? 0  },
              { label: 'Followers',     value: githubData?.followers ?? 0    },
              { label: 'Following',     value: githubData?.following ?? 0    },
              { label: 'Top Langs',     value: githubData?.analysis?.topLanguages?.length ?? 0 },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center py-2 px-1 bg-surface-50 border border-surface-100 rounded-xl"
              >
                <span className="text-base font-bold text-surface-900">{s.value}</span>
                <span className="text-xs text-surface-500 text-center leading-tight mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Repositories */}
          {repos.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Top Repositories</p>
              <div className="space-y-2">
                {repos.slice(0, 3).map((repo) => (
                  <div
                    key={repo.name}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-50 border border-surface-100"
                  >
                    <GitBranch size={13} className="text-surface-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-surface-800 flex-1 truncate">{repo.name}</span>
                    <div className="flex items-center gap-3 flex-shrink-0 text-xs text-surface-400">
                      {repo.language && <span className="hidden sm:inline">{repo.language}</span>}
                      <span className="flex items-center gap-1">
                        <Star size={11} className="text-warning-500" />
                        {repo.stars}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main ProfileInputPage
══════════════════════════════════════════════════════════════ */
export function ProfileInputPage() {
  const navigate = useNavigate()
  const { token } = useAuth()

  /* ── Resume state ────────────────────────────────────── */
  const [resumeState,    setResumeState]    = useState<ResumeState>('empty')
  const [resumeName,     setResumeName]     = useState('')
  const [resumeSize,     setResumeSize]     = useState(0)
  const [uploadPct,      setUploadPct]      = useState(0)
  const [invalidReason,  setInvalidReason]  = useState('')
  const [resumeError,    setResumeError]    = useState('')

  /* ── GitHub state ────────────────────────────────────── */
  const [githubState,    setGithubState]    = useState<GitHubState>('disconnected')
  const [githubUrl,      setGithubUrl]      = useState('')
  const [githubUrlError, setGithubUrlError] = useState('')
  const [githubData,     setGithubData]     = useState<GithubProfileData | null>(null)

  const resumeUploaded  = resumeState === 'uploaded'
  const githubConnected = githubState === 'connected'
  const canAnalyze      = resumeUploaded && githubConnected

  /* ── Initial hydration ────────────────────────────────── */
  useEffect(() => {
    if (!token) return
    let isMounted = true

    getLatestResumeApi(token)
      .then((res) => {
        if (!isMounted || !res || !res.fileName) return
        setResumeName(res.fileName)
        setResumeState('uploaded')
      })
      .catch(() => {})

    getGithubProfileApi(token)
      .then((gh) => {
        if (!isMounted || !gh || !gh.username) return
        setGithubData(gh)
        setGithubUrl(`https://github.com/${gh.username}`)
        setGithubState('connected')
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [token])

  /* ── URL validation on change ────────────────────────── */
  function handleGithubUrlChange(val: string) {
    setGithubUrl(val)
    if (val.length > 0 && !isValidGithubUrl(val)) {
      setGithubUrlError('Please enter a valid GitHub profile URL or username')
    } else {
      setGithubUrlError('')
    }
  }

  /* ── Resume file handler ─────────────────────────────── */
  async function handleFile(file: File) {
    setResumeError('')
    if (file.type === '__invalid_type__') {
      setInvalidReason('Unsupported file type. Please upload a PDF or DOCX.')
      setResumeState('invalid')
      return
    }
    if (file.type === '__too_large__') {
      setInvalidReason('File is too large. Maximum size is 10 MB.')
      setResumeState('invalid')
      return
    }

    setResumeName(file.name)
    setResumeSize(file.size)
    setUploadPct(30)
    setResumeState('uploading')

    try {
      if (token) {
        const res = await uploadResumeApi(token, file)
        setResumeName(res.fileName || file.name)
      }
      setUploadPct(100)
      setTimeout(() => setResumeState('uploaded'), 300)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong uploading your resume. Please try again.'
      setResumeError(msg)
      setResumeState('error')
    }
  }

  /* ── GitHub connect ──────────────────────────────────── */
  async function handleGithubConnect() {
    const username = extractGithubUsername(githubUrl)
    if (!username) {
      setGithubUrlError('Please enter a valid GitHub profile URL or username.')
      return
    }

    setGithubState('connecting')
    setGithubUrlError('')

    try {
      if (token) {
        const gh = await connectGithubApi(token, username)
        setGithubData(gh)
        setGithubUrl(`https://github.com/${gh.username}`)
        setGithubState('connected')
      }
    } catch (err: unknown) {
      setGithubState('disconnected')
      if (err instanceof Error) {
        setGithubUrlError(err.message)
      } else {
        setGithubUrlError('Failed to connect to GitHub.')
      }
    }
  }

  /* ── Progress value for step indicator ──────────────── */
  const setupProgress =
    resumeUploaded && githubConnected ? 100 :
    resumeUploaded || githubConnected ? 50  : 0

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 sm:px-10 h-16 bg-white border-b border-surface-100 flex-shrink-0">
        <Link to="/welcome" className="flex items-center gap-2 no-underline hover:no-underline">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-semibold text-surface-900 text-sm">Career Copilot</span>
        </Link>
        <Badge variant="default" size="sm">Career Setup</Badge>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
        {/* Step progress */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-widest">
              Step 2 of 2
            </span>
            <span className="text-xs text-surface-400">{setupProgress}%</span>
          </div>
          <Progress value={setupProgress} size="sm" color="brand" />

          {/* Mini step labels */}
          <div className="flex items-center gap-2 mt-4 text-xs">
            {[
              { label: 'Resume',           done: resumeUploaded  },
              { label: '→',               done: false, arrow: true },
              { label: 'GitHub',           done: githubConnected  },
              { label: '→',               done: false, arrow: true },
              { label: 'Ready for Analysis', done: canAnalyze    },
            ].map((s, i) =>
              s.arrow ? (
                <span key={i} className="text-surface-300">→</span>
              ) : (
                <span
                  key={i}
                  className={clsx(
                    'font-medium',
                    s.done ? 'text-success-600' : 'text-surface-400'
                  )}
                >
                  {s.done && '✓ '}{s.label}
                </span>
              )
            )}
          </div>
        </div>

        {/* Page title */}
        <div className="w-full max-w-2xl mb-6">
          <h1 className="text-2xl font-bold text-surface-900">Build Your Career Profile</h1>
          <p className="text-sm text-surface-500 mt-1.5 leading-relaxed">
            Add your resume and GitHub profile so Career Copilot can understand
            your skills, projects and experience.
          </p>
        </div>

        {/* Two-column layout: Resume + GitHub */}
        <div className="w-full max-w-2xl space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Resume card */}
            <ResumeCard
              state={resumeState}
              fileName={resumeName}
              fileSize={resumeSize}
              uploadPct={uploadPct}
              invalidReason={invalidReason}
              errorMsg={resumeError}
              onFile={handleFile}
              onReplace={() => setResumeState('empty')}
              onRemove={() => { setResumeState('empty'); setResumeName(''); setResumeSize(0) }}
            />

            {/* GitHub card */}
            <GitHubCard
              state={githubState}
              githubUrl={githubUrl}
              urlError={githubUrlError}
              githubData={githubData}
              onUrlChange={handleGithubUrlChange}
              onConnect={handleGithubConnect}
              onDisconnect={() => { setGithubState('disconnected'); setGithubUrl(''); setGithubData(null) }}
            />
          </div>

          {/* Profile summary — only when both are done */}
          {canAnalyze && (
            <ProfileSummaryCard
              resumeName={resumeName}
              githubUser={githubData?.username || extractGithubUsername(githubUrl) || 'user'}
              onAnalyze={() => navigate('/analysis')}
              canAnalyze={canAnalyze}
            />
          )}

          {/* CTA when not yet ready */}
          {!canAnalyze && (
            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-xs text-surface-400">
                {!resumeUploaded && !githubConnected
                  ? 'Upload your resume and connect GitHub to continue.'
                  : !resumeUploaded
                  ? 'Upload your resume to continue.'
                  : 'Connect your GitHub to continue.'}
              </p>
              <Button
                variant="primary"
                size="md"
                disabled
                rightIcon={<ChevronRight size={15} />}
              >
                Analyze My Profile
              </Button>
            </div>
          )}
        </div>

        {/* Journey indicator */}
        <div className="w-full max-w-2xl mt-10 pt-6 border-t border-surface-100">
          <p className="text-xs text-surface-400 mb-2 font-medium">Your career journey</p>
          <JourneyIndicator activeStep={1} />
        </div>
      </main>
    </div>
  )
}

