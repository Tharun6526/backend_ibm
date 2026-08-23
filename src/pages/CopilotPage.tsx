import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'
import { Button, Input, Badge } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { sendCopilotChatApi } from '../api/copilot'

interface Message {
  id: number
  role: 'user' | 'assistant'
  text: string
}

const SUGGESTED_PROMPTS = [
  'What skills should I learn next for a senior role?',
  'Review my resume for target applications',
  'Help me prepare for my technical interview',
  'What salary should I negotiate for?',
]

export function CopilotPage() {
  const { token, user } = useAuth()
  const userName = user?.name ? user.name.split(' ')[0] : 'there'
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      text: `Hi ${userName}! 👋 I'm your AI Career Copilot. I can help you with job search strategy, resume reviews, interview prep, salary negotiation, and career planning. What would you like to work on today?`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userText = text.trim()
    const userMsg: Message = { id: Date.now(), role: 'user', text: userText }
    
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      if (token) {
        const res = await sendCopilotChatApi(token, {
          message: userText,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        })
        const assistantMsg: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          text: res.reply,
        }
        setMessages((m) => [...m, assistantMsg])
      } else {
        const assistantMsg: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          text: "I'm currently running in guest mode. Please log in to get tailored career responses based on your profile and skills!",
        }
        setMessages((m) => [...m, assistantMsg])
      }
    } catch (err: any) {
      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: err.message || 'Sorry, I ran into an error processing your request. Please try again.',
      }
      setMessages((m) => [...m, assistantMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-surface-900">AI Career Copilot</h2>
            <p className="text-xs text-surface-500">Powered by AI · Connected to Backend</p>
          </div>
          <Badge variant="success" dot size="sm" className="ml-auto">Active</Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              'flex gap-3',
              msg.role === 'user' && 'flex-row-reverse'
            )}
          >
            <div
              className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                msg.role === 'assistant'
                  ? 'bg-brand-500'
                  : 'bg-surface-200'
              )}
            >
              {msg.role === 'assistant'
                ? <Bot size={14} className="text-white" />
                : <User size={14} className="text-surface-600" />
              }
            </div>

            <div
              className={clsx(
                'max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line',
                msg.role === 'assistant'
                  ? 'bg-white border border-surface-200 text-surface-800'
                  : 'bg-brand-500 text-white'
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 items-center text-surface-400 text-sm">
            <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-white border border-surface-200 rounded-xl px-4 py-3 flex items-center gap-2 text-surface-500">
              <Loader2 size={14} className="animate-spin text-brand-500" />
              <span>Copilot is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts (only on fresh state) */}
      {messages.length === 1 && (
        <div className="px-6 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              disabled={loading}
              onClick={() => sendMessage(p)}
              className={clsx(
                'text-left text-sm px-3.5 py-2.5 rounded-xl',
                'border border-surface-200 bg-white text-surface-700',
                'hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700',
                'transition-all duration-150'
              )}
            >
              <Sparkles size={12} className="inline mr-1.5 text-brand-400" />
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-surface-200 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            fullWidth
            placeholder="Ask your AI Career Copilot anything…"
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          />
          <Button
            variant="primary"
            iconOnly
            size="md"
            disabled={loading || !input.trim()}
            onClick={() => sendMessage(input)}
            aria-label="Send"
          >
            <Send size={15} />
          </Button>
        </div>
      </div>
    </div>
  )
}
