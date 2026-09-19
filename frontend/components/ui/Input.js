'use client'

import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`input-field ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-danger">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input

export const Textarea = forwardRef(({ label, error, className = '', rows = 4, ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`input-field resize-none ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-danger">{error}</p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'
