import { type HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 font-medium',
    'rounded-full leading-none',
    'transition-colors duration-150',
  ],
  {
    variants: {
      variant: {
        default:  'bg-surface-100 text-surface-700',
        primary:  'bg-brand-100 text-brand-700',
        accent:   'bg-violet-100 text-violet-700',
        success:  'bg-success-50 text-success-600',
        warning:  'bg-warning-50 text-warning-600',
        danger:   'bg-danger-50 text-danger-600',
        info:     'bg-info-50 text-info-600',
        outline:  'bg-transparent border border-surface-300 text-surface-600',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
      dot: {
        true: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

const dotColorMap: Record<string, string> = {
  default: 'bg-surface-400',
  primary: 'bg-brand-500',
  accent:  'bg-violet-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger:  'bg-danger-500',
  info:    'bg-info-500',
  outline: 'bg-surface-400',
}

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size, dot, children, ...props }, ref) => (
    <span
      ref={ref}
      className={clsx(badgeVariants({ variant, size, dot }), className)}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'inline-block rounded-full flex-shrink-0',
            size === 'lg' ? 'h-2 w-2' : 'h-1.5 w-1.5',
            dotColorMap[variant ?? 'default']
          )}
        />
      )}
      {children}
    </span>
  )
)

Badge.displayName = 'Badge'

export { Badge, badgeVariants }
