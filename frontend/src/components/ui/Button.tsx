import { type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
}

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
  ghost: 'hover:bg-white/10 text-gray-300',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
}
const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm' }

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
    >
      {loading ? <span className="animate-pulse">…</span> : children}
    </button>
  )
}
