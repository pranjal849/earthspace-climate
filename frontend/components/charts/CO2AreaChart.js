'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function CO2AreaChart({ data = [], height = 300 }) {
  const chartData = data.map((d) => ({
    date: new Date(d.timestamp || d.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    co2: d.metrics?.co2Level ?? d.co2Level ?? d.value,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
          unit=" ppm"
          domain={['auto', 'auto']}
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
        <Area
          type="monotone"
          dataKey="co2"
          stroke="var(--color-accent)"
          strokeWidth={2}
          fill="var(--color-accent-light)"
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
