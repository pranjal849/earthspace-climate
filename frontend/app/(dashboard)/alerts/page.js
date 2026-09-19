import connectDB from '@/lib/db'
import Alert from '@/models/Alert'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { Bell } from 'lucide-react'
import AlertsClient from './AlertsClient'

async function getAlerts() {
  await connectDB()

  const alerts = await Alert.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()

  const statusCounts = await Alert.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])

  return {
    alerts: JSON.parse(JSON.stringify(alerts)),
    statusCounts: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
  }
}

export default async function AlertsPage() {
  const { alerts, statusCounts } = await getAlerts()

  return (
    <>
      <PageHeader
        title="Alerts"
        description="Climate anomaly alerts and notifications"
      />
      <AlertsClient initialAlerts={alerts} statusCounts={statusCounts} />
    </>
  )
}
