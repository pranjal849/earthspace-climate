'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COMPARE_COLORS = ['var(--color-accent)', '#B5651D', '#A8333D']

export default function CountryCompareChart({ datasets = [], metric = 'temperature', height = 300 }) {
  // Build combined dataset with date as x-axis
  const allDates = new Set()
  datasets.forEach((ds) => {
    ds.readings?.forEach((r) => {
      allDates.add(new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }))
    })
  })

  const sortedDates = [...allDates].sort((a, b) => new Date(a) - new Date(b))

  const chartData = sortedDates.map((date) => {
    const point = { date }
    datasets.forEach((ds) => {
      const reading = ds.readings?.find(
        (r) => new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) === date
      )
      point[ds.name] = reading?.metrics?.[metric] ?? null
    })
    return point
  })

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
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        {datasets.map((ds, i) => (
          <Line
            key={ds.name}
            type="monotone"
            dataKey={ds.name}
            stroke={COMPARE_COLORS[i % COMPARE_COLORS.length]}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
