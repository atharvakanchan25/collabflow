import { type InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className, ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm text-gray-300">{label}</label>}
    <input
      ref={ref}
      {...props}
      className={clsx(
        'bg-gray-800 border rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition',
        error ? 'border-red-500' : 'border-gray-700',
        className
      )}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
))
Input.displayName = 'Input'
