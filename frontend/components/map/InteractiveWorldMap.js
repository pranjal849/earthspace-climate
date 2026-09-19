'use client'

import { useState, useEffect, memo } from 'react'
import { createPortal } from 'react-dom'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import { motion, AnimatePresence } from 'framer-motion'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const SEVERITY_COLORS = {
  low: '#3A6B52',
  medium: '#B5651D',
  high: '#D38A4D',
  critical: '#A8333D',
  none: '#2F5D50',
}

function InteractiveWorldMap({
  countryData = [],
  onCountryClick,
  autoHighlight = false,
  showLegend = true,
  height = 400,
  className = '',
}) {
  const [hoveredData, setHoveredData] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [highlightedIdx, setHighlightedIdx] = useState(0)
  const [pulsingCountry, setPulsingCountry] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Build lookups
  const dataByCode = {}
  const dataByName = {}
  countryData.forEach((c) => {
    const code = c.isoCode || c._id
    dataByCode[code] = c
    if (c.name) {
      dataByName[c.name.toLowerCase()] = c
    }
  })

  // Auto-highlight for login page
  useEffect(() => {
    if (!autoHighlight || countryData.length === 0) return
    const interval = setInterval(() => {
      setHighlightedIdx((prev) => (prev + 1) % countryData.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [autoHighlight, countryData.length])

  const autoHighlightCode = autoHighlight && countryData.length > 0 ? countryData[highlightedIdx]?.isoCode : null

  const getCountryColor = (data) => {
    if (!data) return null
    if (data.latestAnomaly?.detected || data.anomalyCount > 0) {
      const severity = data.latestAnomaly?.severity || 'low'
      return SEVERITY_COLORS[severity]
    }
    return SEVERITY_COLORS.none
  }

  const handleMouseMove = (e) => {
    setTooltipPos({ x: e.clientX, y: e.clientY })
  }

  return (
    <div className={`relative ${className}`} onMouseMove={handleMouseMove}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [15, 20] }}
        style={{ width: '100%', height }}
      >
        <ZoomableGroup zoom={1} minZoom={1} maxZoom={4}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoName = geo.properties?.name
                let cData = null
                if (geoName) {
                  cData = dataByName[geoName.toLowerCase()]
                  // Fallback to substring match for US/UK/etc mapping differences
                  if (!cData) {
                    const match = countryData.find(c => geoName.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(geoName.toLowerCase()))
                    if (match) cData = match
                  }
                }

                return (
                  <Geography
                    key={geo.rsmKey || geo.id || geoName}
                    geography={geo}
                    fill={cData ? "var(--color-border)" : "var(--color-background)"}
                    stroke="var(--color-surface)"
                    strokeWidth={0.5}
                    onMouseEnter={(e) => {
                      if (geoName) {
                        setHoveredData(cData || { name: geoName })
                        if (cData) {
                          setPulsingCountry(cData.isoCode)
                          setTimeout(() => setPulsingCountry(null), 800)
                        }
                      }
                    }}
                    onMouseLeave={() => setHoveredData(null)}
                    onClick={() => {
                      if (cData && onCountryClick) onCountryClick(cData.isoCode)
                    }}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: 'var(--color-text-muted)', outline: 'none', cursor: cData ? 'pointer' : 'default' },
                      pressed: { outline: 'none' },
                    }}
                  />
                )
              })
            }
          </Geographies>

          {/* Country markers */}
          {countryData.map((c) => {
            if (!c.coordinates || typeof c.coordinates.lng === 'undefined') return null
            const code = c.isoCode || c._id
            const markerColor = getCountryColor(c) || 'var(--color-accent)'
            const isHighlighted = autoHighlightCode === code
            const isHovered = hoveredData?.isoCode === code

            return (
              <Marker
                key={code}
                coordinates={[c.coordinates.lng, c.coordinates.lat]}
                style={{ pointerEvents: 'none' }}
              >
                {/* Pulse ring on hover */}
                {pulsingCountry === code && (
                  <circle
                    r={6}
                    fill="none"
                    stroke={markerColor}
                    strokeWidth={1.5}
                    opacity={0}
                  >
                    <animate attributeName="r" from="4" to="14" dur="0.8s" fill="freeze" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="0.8s" fill="freeze" />
                  </circle>
                )}
                {/* Marker dot */}
                <circle
                  r={isHovered || isHighlighted ? 4 : 2}
                  fill={markerColor}
                  stroke="var(--color-surface)"
                  strokeWidth={1}
                  style={{ transition: 'r 0.15s ease' }}
                />
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip via Portal to prevent clipping */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
        {hoveredData && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed z-50 pointer-events-none"
            style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 10 }}
          >
            <div className="bg-surface border border-border rounded-card shadow-card p-3 min-w-[180px]">
              <p className="text-sm font-semibold text-text-primary mb-1.5">
                {hoveredData.name}
              </p>
              {hoveredData.isoCode ? (
                <div className="space-y-1 text-xs text-text-muted">
                  {hoveredData.latestReading && (
                    <>
                      <div className="flex justify-between">
                        <span>Live Temp</span>
                        <span className="text-text-primary font-medium tabular-nums">
                          {hoveredData.latestReading.temperature?.toFixed(1)}°C
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Live CO₂</span>
                        <span className="text-text-primary font-medium tabular-nums">
                          {hoveredData.latestReading.co2Level?.toFixed(1)} ppm
                        </span>
                      </div>
                    </>
                  )}
                  {(hoveredData.avgTemperature !== undefined) && (
                    <>
                      <div className="flex justify-between pt-1 border-t border-border mt-1">
                        <span>Avg Temp</span>
                        <span className="text-text-primary font-medium tabular-nums">
                          {hoveredData.avgTemperature?.toFixed(1)}°C
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg CO₂</span>
                        <span className="text-text-primary font-medium tabular-nums">
                          {hoveredData.avgCO2?.toFixed(1)} ppm
                        </span>
                      </div>
                    </>
                  )}
                  {hoveredData.anomalyCount > 0 && (
                    <div className="flex justify-between pt-1 border-t border-border mt-1">
                      <span>Anomalies</span>
                      <span className="text-danger font-medium">
                        {hoveredData.anomalyCount}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-text-muted">No climate data available</p>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 bg-surface border border-border rounded-card p-3 text-xs">
          <p className="font-medium text-text-primary mb-2">Anomaly Severity</p>
          <div className="space-y-1.5">
            {[
              { label: 'None', color: SEVERITY_COLORS.none },
              { label: 'Low', color: SEVERITY_COLORS.low },
              { label: 'Medium', color: SEVERITY_COLORS.medium },
              { label: 'High', color: SEVERITY_COLORS.high },
              { label: 'Critical', color: SEVERITY_COLORS.critical },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-text-muted">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(InteractiveWorldMap)
