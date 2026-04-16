import { type ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'success' | 'water'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-bold uppercase tracking-widest transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-accent hover:bg-accent-hover text-on-accent': variant === 'primary',
          'bg-transparent border border-border hover:border-muted text-foreground': variant === 'ghost',
          'bg-danger hover:bg-red-700 text-on-accent': variant === 'danger',
          'bg-success hover:bg-green-600 text-on-accent': variant === 'success',
          'bg-water hover:bg-water-hover text-on-accent': variant === 'water',
        },
        {
          'text-xs px-3 py-1.5 rounded': size === 'sm',
          'text-sm px-4 py-2 rounded-md': size === 'md',
          'text-base px-6 py-3 rounded-lg': size === 'lg',
        },
        className
      )}
    >
      {children}
    </button>
  )
}
