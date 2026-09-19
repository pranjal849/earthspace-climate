import Link from 'next/link'
import Badge from '@/components/ui/Badge'

const severityVariant = {
  low: 'success',
  medium: 'warning',
  high: 'warning',
  critical: 'danger',
}

export default function CountryCard({ country }) {
  const code = country.isoCode || country._id
  const temp = country.latestReading?.temperature ?? country.avgTemperature
  const co2 = country.latestReading?.co2Level ?? country.avgCO2

  return (
    <Link href={`/countries/${code.toLowerCase()}`}>
      <div className="card-hover p-5 space-y-3 h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getFlagEmoji(code)}</span>
            <h3 className="text-sm font-semibold text-text-primary">{country.name}</h3>
          </div>
          {country.anomalyCount > 0 && country.latestAnomaly?.severity && (
            <Badge variant={severityVariant[country.latestAnomaly.severity]} dot>
              {country.latestAnomaly.severity}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-text-muted">Temperature</p>
            <p className="text-lg font-semibold text-text-primary tabular-nums">
              {temp != null ? `${temp.toFixed ? temp.toFixed(1) : temp}°C` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">CO₂</p>
            <p className="text-lg font-semibold text-text-primary tabular-nums">
              {co2 != null ? `${co2.toFixed ? co2.toFixed(1) : co2}` : '—'} <span className="text-xs text-text-muted">ppm</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border">
          <span>{country.region}</span>
          <span>{country.readingCount} readings</span>
        </div>
      </div>
    </Link>
  )
}

function getFlagEmoji(isoCode) {
  const code = isoCode.toUpperCase()
  const codePoints = [...code].map((c) => c.codePointAt(0) + 127397)
  return String.fromCodePoint(...codePoints)
}
