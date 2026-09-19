'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Badge from '@/components/ui/Badge'

export default function LiveDataTable({ readings = [] }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Time</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Country</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Temp</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">CO₂</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Humidity</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Source</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {readings.map((r, i) => (
                <motion.tr
                  key={r._id || i}
                  initial={{ opacity: 0, backgroundColor: 'var(--color-accent-light)' }}
                  animate={{ opacity: 1, backgroundColor: 'transparent' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-border last:border-0"
                >
                  <td className="py-2.5 px-4 text-xs text-text-muted tabular-nums">
                    {new Date(r.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-4 text-sm font-medium text-text-primary">
                    {r.country?.name}
                  </td>
                  <td className="py-2.5 px-4 text-sm tabular-nums">
                    {r.metrics?.temperature?.toFixed(1)}°C
                  </td>
                  <td className="py-2.5 px-4 text-sm tabular-nums">
                    {r.metrics?.co2Level?.toFixed(0)} ppm
                  </td>
                  <td className="py-2.5 px-4 text-sm tabular-nums">
                    {r.metrics?.humidity?.toFixed(0)}%
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge variant="neutral">{r.source}</Badge>
                  </td>
                  <td className="py-2.5 px-4">
                    {r.anomaly?.detected ? (
                      <Badge variant="danger" dot>{r.anomaly.severity}</Badge>
                    ) : (
                      <Badge variant="success">Normal</Badge>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
}
