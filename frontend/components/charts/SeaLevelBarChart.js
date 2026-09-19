'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function SeaLevelBarChart({ data = [], height = 300 }) {
  const chartData = data.map((d) => ({
    name: d.country?.name || d.name || d.label,
    seaLevel: d.metrics?.seaLevel ?? d.seaLevel ?? d.value,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          tickLine={false}
          axisLine={{ stroke: 'var(--color-border)' }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          tickLine={false}
          axisLine={false}
          unit="mm"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="seaLevel" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
