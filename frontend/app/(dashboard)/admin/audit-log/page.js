import connectDB from '@/lib/db'
import AuditLog from '@/models/AuditLog'
import '@/models/User'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { ClipboardList } from 'lucide-react'

async function getAuditLogs() {
  await connectDB()
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('user', 'name email')
    .lean()
  return JSON.parse(JSON.stringify(logs))
}

export default async function AuditLogPage() {
  const logs = await getAuditLogs()

  return (
    <>
      <PageHeader title="Audit Log" description="System and user activity tracking" />
      
      <Card padding={false}>
        {logs.length === 0 ? (
          <EmptyState icon={ClipboardList} message="No logs found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Time</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">User</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Action</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Resource</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Details</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-background transition-colors duration-100">
                    <td className="py-2.5 px-4 text-xs text-text-muted tabular-nums">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4">
                      {log.user ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-text-primary">{log.user.name}</span>
                          <span className="text-xs text-text-muted">{log.user.email}</span>
                        </div>
                      ) : (
                        <span className="text-text-muted italic">System</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge variant="neutral">{log.action}</Badge>
                    </td>
                    <td className="py-2.5 px-4 text-text-muted">{log.resource}</td>
                    <td className="py-2.5 px-4 text-xs">
                      <div className="max-w-xs truncate text-text-muted" title={JSON.stringify(log.details)}>
                        {Object.keys(log.details || {}).length > 0 ? JSON.stringify(log.details) : '—'}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-text-muted tabular-nums">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
