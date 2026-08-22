import { type HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { cva, type VariantProps } from 'class-variance-authority'

/* ─── Track ──────────────────────────────────────────────────── */
const progressVariants = cva(
  'relative overflow-hidden rounded-full bg-surface-100',
  {
    variants: {
      size: {
        xs: 'h-1',
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
        xl: 'h-4',
      },
    },
    defaultVariants: { size: 'md' },
  }
)

/* ─── Fill ───────────────────────────────────────────────────── */
const fillVariants = cva(
  'h-full rounded-full transition-all duration-500 ease-out',
  {
    variants: {
      fillColor: {
        brand:   'bg-brand-500',
        success: 'bg-success-500',
        warning: 'bg-warning-500',
        danger:  'bg-danger-500',
        info:    'bg-info-500',
        accent:  'bg-accent-500',
      },
      striped: {
        true: [
          'bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(255,255,255,0.2)_8px,rgba(255,255,255,0.2)_16px)]',
        ],
      },
      animated: {
        true: 'animate-pulse',
      },
    },
    defaultVariants: { fillColor: 'brand' },
  }
)

export type ProgressColor = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'accent'

export interface ProgressProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof progressVariants> {
  value: number          // 0 – 100
  max?: number
  showLabel?: boolean
  label?: string
  color?: ProgressColor
  striped?: boolean
  animated?: boolean
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      size,
      color,
      striped,
      animated,
      showLabel,
      label,
      ...props
    },
    ref
  ) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100))

    return (
      <div ref={ref} className={clsx('flex flex-col gap-1', className)} {...props}>
        {(label || showLabel) && (
          <div className="flex justify-between items-center text-xs text-surface-500">
            {label && <span>{label}</span>}
            {showLabel && <span className="ml-auto font-medium text-surface-700">{Math.round(pct)}%</span>}
          </div>
        )}

        <div
          className={clsx(progressVariants({ size }))}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={clsx(fillVariants({ fillColor: color, striped: striped ?? undefined, animated: animated ?? undefined }))}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    )
  }
)

Progress.displayName = 'Progress'

export { Progress, progressVariants }
