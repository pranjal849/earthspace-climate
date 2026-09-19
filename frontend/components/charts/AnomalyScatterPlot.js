'use client'

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const SEVERITY_COLORS = {
  low: '#3A6B52',
  medium: '#B5651D',
  high: '#D38A4D',
  critical: '#A8333D',
}

export default function AnomalyScatterPlot({ data = [], height = 300 }) {
  const chartData = data
    .filter((d) => d.anomaly?.detected)
    .map((d, idx) => ({
      x: idx,
      temperature: d.metrics?.temperature ?? d.temperature,
      co2: d.metrics?.co2Level ?? d.co2Level,
      severity: d.anomaly?.severity || 'low',
      country: d.country?.name || 'Unknown',
      date: new Date(d.timestamp).toLocaleDateString(),
    }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
        <XAxis
          dataKey="temperature"
          name="Temperature"
          unit="°C"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          tickLine={false}
          axisLine={{ stroke: 'var(--color-border)' }}
        />
        <YAxis
          dataKey="co2"
          name="CO₂"
          unit=" ppm"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ strokeDasharray: '3 3', stroke: 'var(--color-border)' }}
          contentStyle={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value, name) => [value, name]}
          labelFormatter={(_, payload) => {
            if (payload?.[0]?.payload) {
              return `${payload[0].payload.country} — ${payload[0].payload.date}`
            }
            return ''
          }}
        />
        <Scatter data={chartData} fill="var(--color-accent)">
          {chartData.map((entry, i) => (
            <Cell key={i} fill={SEVERITY_COLORS[entry.severity] || SEVERITY_COLORS.low} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}
