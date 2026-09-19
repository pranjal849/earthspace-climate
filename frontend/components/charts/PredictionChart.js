'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts'

export default function PredictionChart({ historical = [], predictions = [], height = 300 }) {
  const historicalData = historical.map((d) => ({
    date: new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    actual: d.value ?? d.metrics?.temperature,
    type: 'historical',
  }))

  const predictionData = predictions.map((d) => ({
    date: new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    predicted: d.value,
    upper: d.upperBound,
    lower: d.lowerBound,
    type: 'prediction',
  }))

  const combined = [...historicalData, ...predictionData]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={combined} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        {/* Confidence band */}
        <Area
          type="monotone"
          dataKey="upper"
          stroke="none"
          fill="var(--color-accent-light)"
          fillOpacity={0.4}
        />
        <Area
          type="monotone"
          dataKey="lower"
          stroke="none"
          fill="var(--color-background)"
          fillOpacity={1}
        />
        {/* Historical line */}
        <Line
          type="monotone"
          dataKey="actual"
          stroke="var(--color-accent)"
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />
        {/* Prediction line */}
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="var(--color-accent)"
          strokeWidth={2}
          strokeDasharray="6 3"
          dot={false}
          connectNulls={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
