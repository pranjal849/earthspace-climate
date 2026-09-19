import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import { AlertTriangle } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'

const severityVariant = {
  low: 'success',
  medium: 'warning',
  high: 'warning',
  critical: 'danger',
}

export default function RecentAlerts({ alerts = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
        <Link href="/alerts" className="text-xs text-accent hover:underline">
          View all
        </Link>
      </CardHeader>

      {alerts.length === 0 ? (
        <EmptyState icon={AlertTriangle} message="No active alerts" />
      ) : (
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <div
              key={alert._id}
              className="flex items-start justify-between py-2 border-b border-border last:border-0"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-sm text-text-primary font-medium truncate">{alert.title}</p>
                <p className="text-xs text-text-muted truncate">{alert.country?.name}</p>
              </div>
              <Badge variant={severityVariant[alert.severity]} dot>
                {alert.severity}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
