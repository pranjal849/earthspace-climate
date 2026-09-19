'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function StatCard({ title, value, subtitle, icon: Icon, trend, format = 'number' }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value)
      return
    }

    // Count-up animation
    const duration = 600
    const steps = 30
    const increment = value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(value, increment * step)
      setDisplayValue(
        format === 'decimal' ? current.toFixed(1)
          : format === 'percentage' ? current.toFixed(1)
          : Math.round(current)
      )
      if (step >= steps) clearInterval(timer)
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, format])

  const trendColor = trend > 0 ? 'text-danger' : trend < 0 ? 'text-success' : 'text-text-muted'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="card p-5"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-semibold text-text-primary tabular-nums">
            {format === 'percentage' ? `${displayValue}%` : displayValue}
          </p>
          {subtitle && (
            <p className="text-xs text-text-muted">{subtitle}</p>
          )}
          {trend !== undefined && trend !== null && (
            <p className={`text-xs font-medium ${trendColor}`}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}% from last period
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-card bg-accent-light">
            <Icon className="w-5 h-5 text-accent" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
