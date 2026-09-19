import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'

const severityVariant = {
  low: 'success',
  medium: 'warning',
  high: 'warning',
  critical: 'danger',
}

export default function TopCountriesByAnomaly({ countries = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Countries by Anomaly</CardTitle>
        <Link href="/countries" className="text-xs text-accent hover:underline">
          View all
        </Link>
      </CardHeader>

      <div className="space-y-3">
        {countries.map((c, i) => (
          <Link
            key={c.isoCode || c._id}
            href={`/countries/${(c.isoCode || c._id).toLowerCase()}`}
            className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-background -mx-5 px-5 transition-colors duration-100"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-muted tabular-nums w-5">{i + 1}</span>
              <span className="text-sm font-medium text-text-primary">{c.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted tabular-nums">{c.count} anomalies</span>
              {c.latestSeverity && (
                <Badge variant={severityVariant[c.latestSeverity]} dot>
                  {c.latestSeverity}
                </Badge>
              )}
            </div>
          </Link>
        ))}
        {countries.length === 0 && (
          <p className="text-sm text-text-muted py-4 text-center">No anomaly data</p>
        )}
      </div>
    </Card>
  )
}
