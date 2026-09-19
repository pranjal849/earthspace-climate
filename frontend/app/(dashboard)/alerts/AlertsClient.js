'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { Bell, Check, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const severityVariant = { low: 'success', medium: 'warning', high: 'warning', critical: 'danger' }
const statusVariant = { active: 'danger', acknowledged: 'warning', resolved: 'success' }

export default function AlertsClient({ initialAlerts = [], statusCounts = {} }) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.status === filter)

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        setAlerts((prev) => prev.map((a) => a._id === id ? { ...a, status } : a))
        toast.success(`Alert ${status}`)
      }
    } catch {
      toast.error('Failed to update alert')
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'active', 'acknowledged', 'resolved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 text-sm rounded-input transition-colors duration-150 ${
              filter === tab
                ? 'bg-accent text-white'
                : 'border border-border text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab !== 'all' && statusCounts[tab] ? ` (${statusCounts[tab]})` : ''}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={Bell} message="No alerts match this filter" />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <Card key={alert._id} hover className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-medium text-text-primary">{alert.title}</h3>
                  <Badge variant={severityVariant[alert.severity]} dot>{alert.severity}</Badge>
                  <Badge variant={statusVariant[alert.status]}>{alert.status}</Badge>
                </div>
                <p className="text-xs text-text-muted">{alert.description}</p>
                <div className="flex gap-4 text-xs text-text-muted mt-1">
                  <span>{alert.country?.name}</span>
                  <span>{alert.metric}: {alert.currentValue}</span>
                  <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {alert.status !== 'resolved' && (
                <div className="flex gap-1 flex-shrink-0">
                  {alert.status === 'active' && (
                    <Button variant="secondary" size="sm" onClick={() => updateStatus(alert._id, 'acknowledged')}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => updateStatus(alert._id, 'resolved')}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
