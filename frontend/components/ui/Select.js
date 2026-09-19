'use client'

import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(({ label, error, options = [], placeholder = 'Select...', className = '', ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`input-field appearance-none pr-10 ${error ? 'border-danger' : ''} ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
      </div>
      {error && (
        <p className="text-xs text-danger">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
