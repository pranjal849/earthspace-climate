import connectDB from '@/lib/db'
import ClimateReading from '@/models/ClimateReading'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import TemperatureLineChart from '@/components/charts/TemperatureLineChart'
import CO2AreaChart from '@/components/charts/CO2AreaChart'
import SeaLevelBarChart from '@/components/charts/SeaLevelBarChart'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

function getFlagEmoji(isoCode) {
  const code = isoCode.toUpperCase()
  const codePoints = [...code].map((c) => c.codePointAt(0) + 127397)
  return String.fromCodePoint(...codePoints)
}

async function getCountryData(isoCode) {
  await connectDB()
  const code = isoCode.toUpperCase()

  const readings = await ClimateReading.find({ 'country.isoCode': code })
    .sort({ timestamp: 1 })
    .lean()

  if (readings.length === 0) return null

  const country = readings[0].country
  const temps = readings.map((r) => r.metrics.temperature)
  const co2s = readings.map((r) => r.metrics.co2Level)
  const anomalies = readings.filter((r) => r.anomaly.detected)

  return {
    country,
    readings: JSON.parse(JSON.stringify(readings)),
    stats: {
      avgTemp: +(temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
      minTemp: +Math.min(...temps).toFixed(1),
      maxTemp: +Math.max(...temps).toFixed(1),
      avgCO2: +(co2s.reduce((a, b) => a + b, 0) / co2s.length).toFixed(1),
      totalReadings: readings.length,
      anomalyCount: anomalies.length,
      anomalyRate: +((anomalies.length / readings.length) * 100).toFixed(1),
    },
  }
}

export default async function CountryDetailPage({ params }) {
  const resolvedParams = await params
  const data = await getCountryData(resolvedParams.isoCode)

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">Country not found</p>
        <Link href="/countries" className="text-accent hover:underline text-sm mt-2 inline-block">
          Back to countries
        </Link>
      </div>
    )
  }

  const { country, readings, stats } = data

  return (
    <>
      <div className="mb-6">
        <Link href="/countries" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to countries
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getFlagEmoji(country.isoCode)}</span>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">{country.name}</h1>
            <p className="text-sm text-text-muted">{country.region}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {[
          { label: 'Avg Temp', value: `${stats.avgTemp}°C` },
          { label: 'Min Temp', value: `${stats.minTemp}°C` },
          { label: 'Max Temp', value: `${stats.maxTemp}°C` },
          { label: 'Avg CO₂', value: `${stats.avgCO2} ppm` },
          { label: 'Readings', value: stats.totalReadings },
          { label: 'Anomalies', value: stats.anomalyCount },
          { label: 'Anomaly Rate', value: `${stats.anomalyRate}%` },
        ].map((s) => (
          <Card key={s.label} className="text-center p-3">
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className="text-lg font-semibold text-text-primary tabular-nums">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>Temperature History</CardTitle></CardHeader>
          <TemperatureLineChart data={readings} height={280} />
        </Card>
        <Card>
          <CardHeader><CardTitle>CO₂ Levels</CardTitle></CardHeader>
          <CO2AreaChart data={readings} height={280} />
        </Card>
      </div>

      {/* Readings table */}
      <Card padding={false}>
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary">All Readings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Temp</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">CO₂</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Humidity</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Sea Level</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">AQI</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Source</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {readings.slice(-20).reverse().map((r) => (
                <tr key={r._id} className="hover:bg-background transition-colors duration-100">
                  <td className="py-2.5 px-4 text-xs text-text-muted tabular-nums">{new Date(r.timestamp).toLocaleDateString()}</td>
                  <td className="py-2.5 px-4 tabular-nums">{r.metrics.temperature?.toFixed(1)}°C</td>
                  <td className="py-2.5 px-4 tabular-nums">{r.metrics.co2Level?.toFixed(0)} ppm</td>
                  <td className="py-2.5 px-4 tabular-nums">{r.metrics.humidity?.toFixed(0)}%</td>
                  <td className="py-2.5 px-4 tabular-nums">{r.metrics.seaLevel?.toFixed(2)} mm</td>
                  <td className="py-2.5 px-4 tabular-nums">{r.metrics.airQualityIndex}</td>
                  <td className="py-2.5 px-4"><Badge variant="neutral">{r.source}</Badge></td>
                  <td className="py-2.5 px-4">
                    {r.anomaly?.detected ? (
                      <Badge variant={r.anomaly.severity === 'critical' ? 'danger' : r.anomaly.severity === 'high' ? 'warning' : 'success'} dot>
                        {r.anomaly.severity}
                      </Badge>
                    ) : (
                      <Badge variant="success">Normal</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
