'use client'

import { useState } from 'react'
import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsClient({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Settings updated successfully')
      } else {
        toast.error('Failed to update settings')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e, section, field) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.type === 'checkbox' ? e.target.checked : e.target.value
    if (section) {
      setSettings({ ...settings, [section]: { ...settings[section], [field]: val } })
    } else {
      setSettings({ ...settings, [field]: val })
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Anomaly Thresholds</CardTitle>
          <CardDescription>Values above these thresholds trigger automatic alerts</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Temperature (°C)" type="number" value={settings.alertThresholds.temperature} onChange={(e) => handleChange(e, 'alertThresholds', 'temperature')} />
          <Input label="CO₂ Level (ppm)" type="number" value={settings.alertThresholds.co2Level} onChange={(e) => handleChange(e, 'alertThresholds', 'co2Level')} />
          <Input label="Air Quality Index" type="number" value={settings.alertThresholds.airQualityIndex} onChange={(e) => handleChange(e, 'alertThresholds', 'airQualityIndex')} />
          <Input label="Sea Level Rise (mm)" type="number" value={settings.alertThresholds.seaLevel} onChange={(e) => handleChange(e, 'alertThresholds', 'seaLevel')} />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input label="Platform Name" value={settings.siteName} onChange={(e) => handleChange(e, null, 'siteName')} />
          <Input label="Data Retention (days)" type="number" value={settings.dataRetentionDays} onChange={(e) => handleChange(e, null, 'dataRetentionDays')} />
          <Input label="Real-Time Interval (seconds)" type="number" value={settings.realTimeInterval} onChange={(e) => handleChange(e, null, 'realTimeInterval')} />
          <Input label="ML Anomaly Threshold (Z-Score)" type="number" step="0.1" value={settings.anomalyDetectionThreshold} onChange={(e) => handleChange(e, null, 'anomalyDetectionThreshold')} />
        </div>
        
        <div className="space-y-3 pt-4 border-t border-border">
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input type="checkbox" checked={settings.emailNotifications} onChange={(e) => handleChange(e, null, 'emailNotifications')} className="rounded text-accent" />
            Enable Email Notifications
          </label>
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => handleChange(e, null, 'maintenanceMode')} className="rounded text-danger" />
            Maintenance Mode (Suspends public access)
          </label>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={loading} className="gap-2">
          <Save className="w-4 h-4" /> Save Settings
        </Button>
      </div>
    </div>
  )
}
