'use client'

import { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'
import { motion, AnimatePresence } from 'framer-motion'

export default function LiveFeedTicker() {
  const [readings, setReadings] = useState([])

  useEffect(() => {
    const socket = getSocket()

    socket.on('climate:reading', (reading) => {
      setReadings((prev) => [reading, ...prev].slice(0, 5))
    })

    return () => {
      socket.off('climate:reading')
    }
  }, [])

  return (
    <div className="card p-4">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-success mr-1.5 animate-pulse" />
        Live Feed
      </p>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {readings.map((r, i) => (
            <motion.div
              key={r._id || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0"
            >
              <span className="text-text-primary font-medium">{r.country?.name}</span>
              <span className="tabular-nums text-text-muted">
                {r.metrics?.temperature?.toFixed(1)}°C &middot; {r.metrics?.co2Level?.toFixed(0)} ppm
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {readings.length === 0 && (
          <p className="text-xs text-text-muted py-2">Waiting for data...</p>
        )}
      </div>
    </div>
  )
}
