import { useNavigate } from 'react-router-dom'
import { Zap, ArrowRight, Search, BookOpen, CheckCircle } from 'lucide-react'
import { Button, Badge, Card } from '../components/ui'

const steps = [
  {
    number: '01',
    icon: <Search size={20} className="text-brand-600" />,
    title: 'Discover',
    description: 'Understand your skills and experience.',
  },
  {
    number: '02',
    icon: <BookOpen size={20} className="text-accent-500" />,
    title: 'Build',
    description: 'Identify skill gaps and follow a personalized roadmap.',
  },
  {
    number: '03',
    icon: <CheckCircle size={20} className="text-success-600" />,
    title: 'Become Job Ready',
    description: 'Practice, learn and measure your readiness.',
  },
]

export function WelcomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 sm:px-10 h-16 border-b border-surface-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-semibold text-surface-900 text-sm">Career Copilot</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/login')}
        >
          Sign In
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 sm:py-24">
        {/* Label */}
        <Badge variant="primary" size="md" className="mb-6">
          AI Career Copilot
        </Badge>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 text-center leading-tight tracking-tight max-w-2xl">
          Your AI-Powered<br className="hidden sm:block" /> Career Journey
        </h1>

        {/* Supporting text */}
        <p className="mt-5 text-base sm:text-lg text-surface-500 text-center max-w-xl leading-relaxed">
          Discover the right career, build the right skills,
          and become job ready.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight size={17} />}
            onClick={() => navigate('/onboarding')}
            className="w-full sm:w-auto"
          >
            Get Started
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto"
          >
            Sign In
          </Button>
        </div>

        {/* 3-step visual */}
        <div className="mt-20 w-full max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-surface-400 text-center mb-8">
            How it works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connector line between cards — desktop only */}
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-[calc(100%-1px)] w-full h-px bg-surface-200 z-0 translate-x-[1px]" />
                )}
                <Card
                  variant="flat"
                  padding="lg"
                  className="relative z-10 text-center hover:border-brand-200 hover:shadow-sm transition-all duration-200"
                >
                  {/* Step number */}
                  <p className="text-xs font-bold tracking-widest text-surface-300 mb-3">
                    {step.number}
                  </p>
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  {/* Title */}
                  <h3 className="text-sm font-semibold text-surface-900 mb-2">
                    {step.title}
                  </h3>
                  {/* Description */}
                  <p className="text-xs text-surface-500 leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-surface-400 border-t border-surface-100 px-6">
        © {new Date().getFullYear()} AI Career Copilot. Built to accelerate your career.
      </footer>
    </div>
  )
}
