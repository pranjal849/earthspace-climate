'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Globe } from 'lucide-react'

/**
 * Reusable country search input with live dropdown.
 * 
 * Props:
 * - value: current search string (controlled)
 * - onChange: called with (searchString) when user types
 * - onSelect: called with (country) when user clicks a country, or null when cleared
 * - countries: array of country objects with { name, isoCode }
 * - placeholder: input placeholder text
 * - className: additional classes for the container
 * - inputClassName: additional classes for the input element
 * - size: 'sm' | 'md' (default: 'md')
 * - showGlobal: show "Global (All)" option at top (default: false)
 * - onGlobalSelect: called when Global is clicked
 */
export default function CountrySearchInput({
  value = '',
  onChange,
  onSelect,
  countries = [],
  placeholder = 'Search countries...',
  className = '',
  inputClassName = '',
  size = 'md',
  showGlobal = false,
  onGlobalSelect,
  selectedIsoCode = '',
}) {
  const [showDropdown, setShowDropdown] = useState(false)
  const containerRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter countries based on search
  const filteredCountries = value.trim()
    ? countries.filter((c) => {
        const q = value.toLowerCase()
        return c.name.toLowerCase().includes(q) || c.isoCode.toLowerCase().includes(q)
      })
    : showDropdown
    ? countries
    : []

  const handleCountryClick = (country) => {
    setShowDropdown(false)
    if (onSelect) onSelect(country)
  }

  const handleGlobalClick = () => {
    setShowDropdown(false)
    if (onGlobalSelect) onGlobalSelect()
    if (onSelect) onSelect(null)
  }

  const handleClear = () => {
    if (onChange) onChange('')
    if (onSelect) onSelect(null)
    setShowDropdown(false)
  }

  const sizeClasses = size === 'sm' ? 'py-1 text-sm' : 'py-2 text-sm'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            if (onChange) onChange(e.target.value)
            setShowDropdown(e.target.value.trim().length > 0)
          }}
          onFocus={() => {
            if (value.trim().length > 0 || showGlobal) setShowDropdown(true)
          }}
          className={`w-full bg-background border border-border rounded-lg pl-9 pr-9 ${sizeClasses} text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted ${inputClassName}`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDropdown && (filteredCountries.length > 0 || showGlobal) && (
        <div className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {showGlobal && (
            <button
              type="button"
              onClick={handleGlobalClick}
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-accent-light hover:text-accent ${
                !selectedIsoCode ? 'bg-accent-light text-accent font-semibold' : 'text-text-primary'
              }`}
            >
              🌍 Global (All Readings)
            </button>
          )}
          {filteredCountries.length > 0 ? (
            <>
              {value.trim() && (
                <div className="px-3 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider border-b border-border bg-background">
                  {filteredCountries.length} {filteredCountries.length === 1 ? 'country' : 'countries'} found
                </div>
              )}
              {filteredCountries.map((c) => (
                <button
                  key={c.isoCode}
                  type="button"
                  onClick={() => handleCountryClick(c)}
                  className={`w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-accent-light hover:text-accent transition-colors flex items-center gap-2.5 ${
                    selectedIsoCode === c.isoCode ? 'bg-accent-light text-accent font-semibold' : ''
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                  <span>
                    {c.name} <span className="text-text-muted text-xs">({c.isoCode})</span>
                  </span>
                </button>
              ))}
            </>
          ) : (
            !showGlobal && (
              <div className="px-3 py-4 text-sm text-text-muted text-center">
                No countries matching &ldquo;{value}&rdquo;
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
