// Shared journey indicator used across all post-analysis pages.
// Pass the index (0-based) of the currently active step.
//
// Steps:
//  0 Profile Setup
//  1 Resume & GitHub
//  2 AI Analysis
//  3 Career Recommendation
//  4 Skill Gap
//  5 Roadmap
//  6 Courses
//  7 Job Readiness
//  8 Mock Interview

import { clsx } from 'clsx'
import { CheckCircle2 } from 'lucide-react'

const JOURNEY_LABELS = [
  'Profile Setup',
  'Resume & GitHub',
  'AI Analysis',
  'Career Recommendation',
  'Skill Gap',
  'Roadmap',
  'Courses',
  'Job Readiness',
  'Mock Interview',
]

interface JourneyIndicatorProps {
  /** 0-based index of the active (current) step */
  activeStep: number
}

export function JourneyIndicator({ activeStep }: JourneyIndicatorProps) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {JOURNEY_LABELS.map((label, i) => {
        const done   = i < activeStep
        const active = i === activeStep
        return (
          <div key={label} className="flex items-center gap-0 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-1">
              {done ? (
                <CheckCircle2 size={12} className="text-success-500 flex-shrink-0" />
              ) : (
                <div
                  className={clsx(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    active ? 'bg-brand-500' : 'bg-surface-200'
                  )}
                />
              )}
              <span
                className={clsx(
                  'text-xs whitespace-nowrap',
                  done              && 'text-success-600 font-medium',
                  active && !done   && 'text-brand-600 font-medium',
                  !done && !active  && 'text-surface-400'
                )}
              >
                {label}
              </span>
            </div>
            {i < JOURNEY_LABELS.length - 1 && (
              <div className="w-4 h-px bg-surface-200 flex-shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}
