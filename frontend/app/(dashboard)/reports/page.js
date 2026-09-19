import connectDB from '@/lib/db'
import Report from '@/models/Report'
import '@/models/User'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import { FileText, Download, Calendar, User } from 'lucide-react'

async function getReports() {
  await connectDB()
  const reports = await Report.find()
    .sort({ createdAt: -1 })
    .populate('generatedBy', 'name')
    .lean()
  return JSON.parse(JSON.stringify(reports))
}

export default async function ReportsPage() {
  const reports = await getReports()
  const typeColors = { monthly: 'success', quarterly: 'default', annual: 'warning', custom: 'neutral', anomaly: 'danger', comparison: 'default' }

  return (
    <>
      <PageHeader title="Reports" description="Generated climate analysis reports" />

      {reports.length === 0 ? (
        <Card><EmptyState icon={FileText} message="No reports generated yet" /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Card key={report._id} hover>
              <div className="flex items-start justify-between mb-3">
                <Badge variant={typeColors[report.type] || 'neutral'}>{report.type}</Badge>
                <Badge variant="neutral">{report.format?.toUpperCase()}</Badge>
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-2 line-clamp-2">{report.title}</h3>
              <p className="text-xs text-text-muted mb-3 line-clamp-2">{report.summary}</p>
              <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(report.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{report.generatedBy?.name || 'System'}</span>
              </div>
              {report.metrics && (
                <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-border">
                  <div><span className="text-text-muted">Readings:</span> <span className="font-medium tabular-nums">{report.metrics.totalReadings}</span></div>
                  <div><span className="text-text-muted">Anomalies:</span> <span className="font-medium tabular-nums">{report.metrics.anomaliesDetected}</span></div>
                  <div><span className="text-text-muted">Avg Temp:</span> <span className="font-medium tabular-nums">{report.metrics.avgTemperature}°C</span></div>
                  <div><span className="text-text-muted">Avg CO₂:</span> <span className="font-medium tabular-nums">{report.metrics.avgCO2} ppm</span></div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
