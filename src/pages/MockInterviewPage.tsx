import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  Mic,
  Send,
  Bot,
  User,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Button, Input, Badge, Card, Progress } from '../components/ui'
import { JourneyIndicator } from '../components/JourneyIndicator'
import { useAuth } from '../context/AuthContext'
import {
  startInterviewApi,
  submitInterviewAnswerApi,
  type InterviewEvaluation
} from '../api/interview'

/* ══════════════════════════════════════════════════════════════
   Types & Interfaces
══════════════════════════════════════════════════════════════ */
type MessageRole = 'interviewer' | 'user' | 'feedback'

interface Message {
  id: string | number
  role: MessageRole
  text: string
}

interface ActiveQuestion {
  id: string
  text: string
  category: string
  orderIndex: number
}

/* ══════════════════════════════════════════════════════════════
   Session Complete View Component
══════════════════════════════════════════════════════════════ */
function SessionComplete({
  evaluations,
  onRestart,
  onDone
}: {
  evaluations: InterviewEvaluation[]
  onRestart: () => void
  onDone: () => void
}) {
  const avgScore = useMemo(() => {
    if (evaluations.length === 0) return 80
    const sum = evaluations.reduce((acc, e) => acc + e.overallScore, 0)
    return Math.round(sum / evaluations.length)
  }, [evaluations])

  const avgCorrectness = useMemo(() => {
    if (evaluations.length === 0) return 80
    return Math.round(evaluations.reduce((acc, e) => acc + e.correctness, 0) / evaluations.length)
  }, [evaluations])

  const avgCommunication = useMemo(() => {
    if (evaluations.length === 0) return 80
    return Math.round(evaluations.reduce((acc, e) => acc + e.communication, 0) / evaluations.length)
  }, [evaluations])

  const avgTechDepth = useMemo(() => {
    if (evaluations.length === 0) return 80
    return Math.round(evaluations.reduce((acc, e) => acc + e.technicalDepth, 0) / evaluations.length)
  }, [evaluations])

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-6 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-success-50 border-2 border-success-200 flex items-center justify-center">
        <CheckCircle2 size={30} className="text-success-500" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-surface-900 mb-1">Mock Interview Complete! 🎉</h2>
        <p className="text-sm text-surface-500 max-w-sm leading-relaxed">
          Overall Interview Performance Score
        </p>
        <div className="mt-2 text-3xl font-bold text-brand-600">{avgScore} / 100</div>
      </div>

      {/* Breakdown score cards */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        <div className="p-3 bg-surface-50 border border-surface-200 rounded-xl text-center">
          <span className="text-xs text-surface-500 block">Correctness</span>
          <span className="text-sm font-bold text-surface-800">{avgCorrectness}%</span>
        </div>
        <div className="p-3 bg-surface-50 border border-surface-200 rounded-xl text-center">
          <span className="text-xs text-surface-500 block">Communication</span>
          <span className="text-sm font-bold text-surface-800">{avgCommunication}%</span>
        </div>
        <div className="p-3 bg-surface-50 border border-surface-200 rounded-xl text-center">
          <span className="text-xs text-surface-500 block">Tech Depth</span>
          <span className="text-sm font-bold text-surface-800">{avgTechDepth}%</span>
        </div>
      </div>

      <Card padding="md" className="w-full max-w-sm text-left border-brand-100 bg-brand-50/30">
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">AI Feedback & Next Steps</p>
        <ul className="space-y-1.5">
          {[
            'Review AI feedback breakdown for each answer',
            'Practice technical explanations out loud',
            'Use STAR format for behavioral responses',
            'Review your updated Job Readiness score',
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs text-surface-600">
              <CheckCircle2 size={12} className="text-success-500 flex-shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Button variant="primary" size="md" fullWidth rightIcon={<ChevronRight size={15} />} onClick={onDone}>
          View Job Readiness
        </Button>
        <Button variant="secondary" size="md" fullWidth leftIcon={<RotateCcw size={14} />} onClick={onRestart}>
          Restart Interview
        </Button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main MockInterviewPage Component
══════════════════════════════════════════════════════════════ */
export function MockInterviewPage() {
  const navigate = useNavigate()
  const { token } = useAuth()

  const careerTarget = sessionStorage.getItem('cc_careerGoal') || 'Software Developer'

  const [interviewId, setInterviewId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<ActiveQuestion | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [evaluations, setEvaluations] = useState<InterviewEvaluation[]>([])
  const [input, setInput] = useState('')

  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [awaitingFeedback, setAwaitingFeedback] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const TOTAL_QUESTIONS = 3

  /* ── Start Live Interview Session ──────────────────────────── */
  const initInterview = useCallback(async () => {
    if (!token) return
    setIsLoadingSession(true)
    setError(null)
    setSendError(null)
    setMessages([])
    setEvaluations([])
    setDone(false)

    try {
      const res = await startInterviewApi(token, { type: 'TECHNICAL', difficulty: 'MEDIUM', role: careerTarget })
      setInterviewId(res.interviewId)
      setCurrentQuestion(res.question)

      const introMsg: Message = {
        id: 'intro',
        role: 'interviewer',
        text: `Hi! 👋 I'm your AI mock interviewer. We'll work through ${TOTAL_QUESTIONS} questions — covering core technical and behavioral concepts — to prepare you for real ${careerTarget} interviews.\n\nTake your time with each answer. When you submit, I'll give you instant AI feedback.\n\nLet's begin!`
      }

      const firstQMsg: Message = {
        id: res.question.id,
        role: 'interviewer',
        text: `Q1 of ${TOTAL_QUESTIONS} · ${res.question.category}\n\n${res.question.text}`
      }

      setMessages([introMsg, firstQMsg])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to start mock interview.'
      setError(msg)
    } finally {
      setIsLoadingSession(false)
    }
  }, [token, careerTarget])

  useEffect(() => {
    initInterview()
  }, [initInterview])

  /* ── Scroll to Bottom on New Messages ─────────────────────── */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, awaitingFeedback])

  /* ── Submit Answer Handler ───────────────────────────────── */
  async function sendAnswer(text: string) {
    const trimmed = text.trim()
    if (!trimmed || awaitingFeedback || !token || !interviewId || !currentQuestion) return

    const q = currentQuestion
    const userMsg: Message = { id: `user_${Date.now()}`, role: 'user', text: trimmed }

    setMessages((m) => [...m, userMsg])
    setInput('')
    setAwaitingFeedback(true)
    setSendError(null)

    try {
      const res = await submitInterviewAnswerApi(token, interviewId, {
        questionId: q.id,
        answerText: trimmed
      })

      const evalData = res.evaluation
      setEvaluations((prev) => [...prev, evalData])

      const feedbackMsg: Message = {
        id: `fb_${res.answerId}`,
        role: 'feedback',
        text: `💡 AI Feedback (Overall Score: ${evalData.overallScore}/100):\n${evalData.feedback}\n\n• Correctness: ${evalData.correctness}%\n• Communication: ${evalData.communication}%\n• Technical Depth: ${evalData.technicalDepth}%`
      }

      setMessages((m) => [...m, feedbackMsg])

      if (res.nextQuestion && !res.interviewCompleted) {
        const nextQ = res.nextQuestion
        setCurrentQuestion(nextQ)

        const nextMsg: Message = {
          id: nextQ.id,
          role: 'interviewer',
          text: `Q${nextQ.orderIndex + 1} of ${TOTAL_QUESTIONS} · ${nextQ.category}\n\n${nextQ.text}`
        }
        setMessages((m) => [...m, nextMsg])
        setTimeout(() => inputRef.current?.focus(), 300)
      } else {
        setDone(true)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to evaluate answer. Please try again.'
      setSendError(msg)
    } finally {
      setAwaitingFeedback(false)
    }
  }

  const currentQIndex = currentQuestion ? currentQuestion.orderIndex : 0
  const progress = Math.round(((currentQIndex + (done ? 1 : 0)) / TOTAL_QUESTIONS) * 100)

  /* ── Loading Session View ───────────────────────────────── */
  if (isLoadingSession) {
    return (
      <div className="flex flex-col h-full max-w-3xl mx-auto p-6 space-y-6">
        <div className="px-6 py-4 border-b border-surface-200">
          <h2 className="text-base font-semibold text-surface-900">Mock Interview</h2>
          <p className="text-xs text-surface-500">Preparing AI interviewer session...</p>
        </div>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <RefreshCw size={36} className="text-brand-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-surface-900 mb-1">Starting Mock Interview</h3>
            <p className="text-sm text-surface-500 max-w-md">
              Generating tailored interview questions for your {careerTarget} career path...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  /* ── Error Starting Session View ────────────────────────── */
  if (error) {
    return (
      <div className="flex flex-col h-full max-w-3xl mx-auto p-6 space-y-6">
        <div className="px-6 py-4 border-b border-surface-200">
          <h2 className="text-base font-semibold text-surface-900">Mock Interview</h2>
        </div>
        <Card padding="lg" className="border-danger-200 bg-danger-50/20">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle size={40} className="text-danger-500 mb-3" />
            <h3 className="text-lg font-semibold text-surface-900 mb-1">Unable to start mock interview</h3>
            <p className="text-sm text-surface-600 max-w-md mb-6">{error}</p>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={initInterview}
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  /* ── Main Chat Interface ────────────────────────────────── */
  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-surface-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <Mic size={17} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-surface-900">Mock Interview</h2>
            <p className="text-xs text-surface-500 truncate">
              {careerTarget} · {TOTAL_QUESTIONS} questions
            </p>
          </div>
          <Badge variant={done ? 'success' : 'primary'} dot size="sm">
            {done ? 'Complete' : `Q${currentQIndex + 1} / ${TOTAL_QUESTIONS}`}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <Progress value={progress} size="xs" color={done ? 'success' : 'brand'} />
        </div>
      </div>

      {/* ── Hint Banner ────────────────────────────────────── */}
      {!done && currentQuestion && (
        <div className="px-6 py-2.5 border-b border-surface-100 bg-brand-50/50 flex-shrink-0">
          <p className="text-xs text-brand-700">
            <Sparkles size={11} className="inline mr-1 text-brand-400" />
            <strong>Tip:</strong> Provide clear, structured answers with key concepts, trade-offs, and examples.
          </p>
        </div>
      )}

      {/* Send Error Toast */}
      {sendError && (
        <div className="px-6 py-2 bg-danger-50 border-b border-danger-200 text-danger-700 text-xs flex items-center justify-between">
          <span>{sendError}</span>
          <button onClick={() => setSendError(null)} className="font-bold hover:text-danger-900">×</button>
        </div>
      )}

      {/* ── Messages or Complete View ──────────────────────── */}
      {done ? (
        <SessionComplete
          evaluations={evaluations}
          onRestart={initInterview}
          onDone={() => navigate('/job-readiness')}
        />
      ) : (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={clsx(
                  'flex gap-3',
                  msg.role === 'user' && 'flex-row-reverse'
                )}
              >
                {/* Avatar */}
                <div
                  className={clsx(
                    'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                    msg.role === 'interviewer' ? 'bg-brand-500' :
                    msg.role === 'feedback' ? 'bg-success-500' :
                    'bg-surface-200'
                  )}
                >
                  {msg.role === 'user'
                    ? <User size={14} className="text-surface-600" />
                    : <Bot size={14} className="text-white" />
                  }
                </div>

                {/* Bubble */}
                <div
                  className={clsx(
                    'max-w-[82%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line',
                    msg.role === 'interviewer' && 'bg-white border border-surface-200 text-surface-800',
                    msg.role === 'user' && 'bg-brand-500 text-white',
                    msg.role === 'feedback' && 'bg-success-50 border border-success-200 text-success-800',
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing / Evaluating Indicator */}
            {awaitingFeedback && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-success-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-success-50 border border-success-200 rounded-xl px-4 py-3 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-success-600" />
                  <span className="text-xs text-success-700 font-medium">Evaluating answer with AI...</span>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* ── Input Area ─────────────────────────────────── */}
          <div className="px-6 py-4 border-t border-surface-200 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                fullWidth
                placeholder="Type your answer here…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendAnswer(input)
                  }
                }}
                disabled={awaitingFeedback}
              />
              <Button
                variant="primary"
                iconOnly
                size="md"
                onClick={() => sendAnswer(input)}
                disabled={awaitingFeedback || !input.trim()}
                aria-label="Submit answer"
              >
                {awaitingFeedback ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </Button>
            </div>
            <p className="text-xs text-surface-400 mt-2 text-center">
              Press Enter or click Send to submit your answer
            </p>
          </div>
        </>
      )}

      {/* ── Journey Indicator ──────────────────────────────── */}
      <div className="px-6 py-4 border-t border-surface-100 flex-shrink-0">
        <p className="text-xs text-surface-400 mb-2 font-medium">Your career journey</p>
        <JourneyIndicator activeStep={8} />
      </div>
    </div>
  )
}
