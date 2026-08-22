import { type HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { cva, type VariantProps } from 'class-variance-authority'

/* ── Card root ──────────────────────────────────────────────── */
const cardVariants = cva(
  'rounded-xl bg-white transition-shadow duration-200',
  {
    variants: {
      variant: {
        default: 'border border-surface-200 shadow-sm',
        elevated: 'shadow-md',
        flat: 'border border-surface-200',
        ghost: 'bg-surface-50',
      },
      padding: {
        none: '',
        sm:   'p-4',
        md:   'p-5',
        lg:   'p-6',
        xl:   'p-8',
      },
      hoverable: {
        true: 'hover:shadow-md cursor-pointer',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
)

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hoverable, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(cardVariants({ variant, padding, hoverable }), className)}
      {...props}
    />
  )
)
Card.displayName = 'Card'

/* ── CardHeader ─────────────────────────────────────────────── */
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('flex flex-col gap-1', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

/* ── CardTitle ──────────────────────────────────────────────── */
const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={clsx('text-base font-semibold text-surface-900 leading-snug', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

/* ── CardDescription ─────────────────────────────────────────── */
const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={clsx('text-sm text-surface-500 leading-relaxed', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

/* ── CardContent ─────────────────────────────────────────────── */
const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

/* ── CardFooter ──────────────────────────────────────────────── */
const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'flex items-center gap-3 pt-4 mt-4 border-t border-surface-100',
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

/* ── Divider ─────────────────────────────────────────────────── */
const CardDivider = forwardRef<HTMLHRElement, HTMLAttributes<HTMLHRElement>>(
  ({ className, ...props }, ref) => (
    <hr
      ref={ref}
      className={clsx('border-surface-100 my-4', className)}
      {...props}
    />
  )
)
CardDivider.displayName = 'CardDivider'

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardDivider,
  cardVariants,
}
