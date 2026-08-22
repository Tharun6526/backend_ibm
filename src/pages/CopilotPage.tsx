import { Sparkles, Send, Bot, User } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'
import { Button, Input, Badge } from '../components/ui'

interface Message {
  id: number
  role: 'user' | 'assistant'
  text: string
}

const SUGGESTED_PROMPTS = [
  'What skills should I learn next for a senior role?',
  'Review my resume for the Stripe application',
  'Help me prepare for my interview at Vercel',
  'What salary should I negotiate for?',
]

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: 'assistant',
    text: "Hi Alex! 👋 I'm your AI Career Copilot. I can help you with job search strategy, resume reviews, interview prep, salary negotiation, and career planning. What would you like to work on today?",
  },
]

export function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: Date.now(), role: 'user', text: text.trim() }
    const assistantMsg: Message = {
      id: Date.now() + 1,
      role: 'assistant',
      text: "Great question! This is a UI preview — AI responses will appear here once the backend is connected. For now, explore the interface and see how the conversation layout looks.",
    }
    setMessages((m) => [...m, userMsg, assistantMsg])
    setInput('')
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
            <p className="text-xs text-surface-500">Powered by AI · Always available</p>
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
                'max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'assistant'
                  ? 'bg-white border border-surface-200 text-surface-800'
                  : 'bg-brand-500 text-white'
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested prompts (only on fresh state) */}
      {messages.length === 1 && (
        <div className="px-6 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
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
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          />
          <Button
            variant="primary"
            iconOnly
            size="md"
            onClick={() => sendMessage(input)}
            aria-label="Send"
          >
            <Send size={15} />
          </Button>
        </div>
        <p className="text-xs text-surface-400 mt-2 text-center">
          UI preview only — AI responses are mocked
        </p>
      </div>
    </div>
  )
}
