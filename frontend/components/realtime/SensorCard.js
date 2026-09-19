'use client'

import { motion } from 'framer-motion'

export default function SensorCard({ country, reading, isOnline = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success' : 'bg-danger'}`}
          />
          <span className="text-sm font-medium text-text-primary">
            {country || 'Unknown'}
          </span>
        </div>
        <span className="text-xs text-text-muted">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {reading && (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-text-muted">Temperature</p>
            <p className="text-text-primary font-semibold tabular-nums text-base">
              {reading.metrics?.temperature?.toFixed(1)}°C
            </p>
          </div>
          <div>
            <p className="text-text-muted">CO₂</p>
            <p className="text-text-primary font-semibold tabular-nums text-base">
              {reading.metrics?.co2Level?.toFixed(0)} ppm
            </p>
          </div>
          <div>
            <p className="text-text-muted">Humidity</p>
            <p className="text-text-primary font-medium tabular-nums">
              {reading.metrics?.humidity?.toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-text-muted">AQI</p>
            <p className="text-text-primary font-medium tabular-nums">
              {reading.metrics?.airQualityIndex}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
