import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-lg',
    'transition-all duration-150 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-brand-500 text-white',
          'hover:bg-brand-600 active:bg-brand-700',
          'focus-visible:ring-brand-500',
          'shadow-sm hover:shadow-md',
        ],
        secondary: [
          'bg-surface-100 text-surface-700',
          'border border-surface-200',
          'hover:bg-surface-200 active:bg-surface-300',
          'focus-visible:ring-surface-400',
        ],
        outline: [
          'bg-transparent text-brand-600',
          'border border-brand-300',
          'hover:bg-brand-50 active:bg-brand-100',
          'focus-visible:ring-brand-500',
        ],
        ghost: [
          'bg-transparent text-surface-600',
          'hover:bg-surface-100 active:bg-surface-200',
          'focus-visible:ring-surface-400',
        ],
        danger: [
          'bg-danger-500 text-white',
          'hover:bg-danger-600 active:bg-danger-700',
          'focus-visible:ring-danger-500',
          'shadow-sm',
        ],
        success: [
          'bg-success-500 text-white',
          'hover:bg-success-600',
          'focus-visible:ring-success-500',
          'shadow-sm',
        ],
      },
      size: {
        xs: 'h-7 px-2.5 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-5 text-base',
        xl: 'h-12 px-6 text-base',
      },
      fullWidth: {
        true: 'w-full',
      },
      iconOnly: {
        true: 'px-0 aspect-square',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      iconOnly,
      isLoading,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(buttonVariants({ variant, size, fullWidth, iconOnly }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {!iconOnly && children}
        {!isLoading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
