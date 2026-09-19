'use client'

const METRICS_LABELS = {
  temperature: 'Temp',
  co2Level: 'CO₂',
  humidity: 'Humid',
  seaLevel: 'Sea',
  precipitation: 'Precip',
  windSpeed: 'Wind',
  uvIndex: 'UV',
  airQualityIndex: 'AQI',
}

function getCorrelationColor(value) {
  if (value >= 0.7) return 'bg-accent text-white'
  if (value >= 0.4) return 'bg-accent-light text-accent'
  if (value >= 0.2) return 'bg-background text-text-muted'
  if (value >= -0.2) return 'bg-background text-text-muted'
  if (value >= -0.4) return 'bg-background text-text-muted'
  if (value >= -0.7) return 'bg-orange-50 dark:bg-orange-950 text-warning'
  return 'bg-red-50 dark:bg-red-950 text-danger'
}

export default function CorrelationHeatmap({ matrix = {}, metrics = [] }) {
  const displayMetrics = metrics.length > 0 ? metrics : Object.keys(matrix)

  if (displayMetrics.length === 0) {
    return <p className="text-sm text-text-muted p-4">No correlation data available</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="p-2 text-left text-text-muted font-medium" />
            {displayMetrics.map((m) => (
              <th key={m} className="p-2 text-center text-text-muted font-medium">
                {METRICS_LABELS[m] || m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayMetrics.map((m1) => (
            <tr key={m1}>
              <td className="p-2 text-text-muted font-medium whitespace-nowrap">
                {METRICS_LABELS[m1] || m1}
              </td>
              {displayMetrics.map((m2) => {
                const value = matrix[m1]?.[m2] ?? 0
                const colorClass = m1 === m2 ? 'bg-accent text-white' : getCorrelationColor(value)

                return (
                  <td key={m2} className="p-1">
                    <div
                      className={`w-full py-2 rounded text-center font-medium tabular-nums ${colorClass}`}
                      title={`${METRICS_LABELS[m1]} vs ${METRICS_LABELS[m2]}: ${value}`}
                    >
                      {m1 === m2 ? '1.00' : value.toFixed(2)}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
