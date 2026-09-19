'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts'

export default function TemperatureLineChart({ data = [], anomalies = [], height = 300 }) {
  const chartData = data.map((d) => ({
    date: new Date(d.timestamp || d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    temperature: d.metrics?.temperature ?? d.temperature ?? d.value,
    isAnomaly: d.anomaly?.detected || false,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          tickLine={false}
          axisLine={{ stroke: 'var(--color-border)' }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          tickLine={false}
          axisLine={false}
          unit="°C"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
          labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
        />
        <Line
          type="monotone"
          dataKey="temperature"
          stroke="var(--color-accent)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: 'var(--color-accent)' }}
        />
        {chartData
          .filter((d) => d.isAnomaly)
          .map((d, i) => (
            <ReferenceDot
              key={i}
              x={d.date}
              y={d.temperature}
              r={4}
              fill="var(--color-danger)"
              stroke="var(--color-surface)"
              strokeWidth={2}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
