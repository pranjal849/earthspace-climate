'use client'

import StatCard from '@/components/ui/StatCard'
import { Thermometer, Wind, Droplets, AlertTriangle } from 'lucide-react'

export default function KPIStrip({ kpis = {} }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Avg Temperature"
        value={kpis.avgTemperature || 0}
        format="decimal"
        subtitle={`Across ${kpis.totalCountries || 0} countries`}
        icon={Thermometer}
        trend={1.2}
      />
      <StatCard
        title="Avg CO₂ Level"
        value={kpis.avgCO2 || 0}
        format="decimal"
        subtitle="Parts per million"
        icon={Wind}
        trend={2.1}
      />
      <StatCard
        title="Active Alerts"
        value={kpis.activeAlerts || 0}
        subtitle={`${kpis.criticalAlerts || 0} critical`}
        icon={AlertTriangle}
      />
      <StatCard
        title="Anomaly Rate"
        value={kpis.anomalyRate || 0}
        format="percentage"
        subtitle={`${kpis.totalReadings || 0} total readings`}
        icon={Droplets}
      />
    </div>
  )
}
