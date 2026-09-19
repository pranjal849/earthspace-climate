import connectDB from '@/lib/db'
import ClimateReading from '@/models/ClimateReading'
import Alert from '@/models/Alert'
import PageHeader from '@/components/layout/PageHeader'
import KPIStrip from '@/components/dashboard/KPIStrip'
import RecentAlerts from '@/components/dashboard/RecentAlerts'
import LiveFeedTicker from '@/components/dashboard/LiveFeedTicker'
import TopCountriesByAnomaly from '@/components/dashboard/TopCountriesByAnomaly'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import TemperatureLineChart from '@/components/charts/TemperatureLineChart'
import CO2AreaChart from '@/components/charts/CO2AreaChart'

async function getDashboardData() {
  await connectDB()

  const [totalReadings, totalCountries, activeAlerts, criticalAlerts, recentReadings, avgMetrics, anomalyCount, topAnomalyCountries, recentAlertDocs] = await Promise.all([
    ClimateReading.countDocuments(),
    ClimateReading.distinct('country.isoCode').then((a) => a.length),
    Alert.countDocuments({ status: 'active' }),
    Alert.countDocuments({ status: 'active', severity: 'critical' }),
    ClimateReading.find().sort({ timestamp: -1 }).limit(30).lean(),
    ClimateReading.aggregate([{ $group: { _id: null, avgTemp: { $avg: '$metrics.temperature' }, avgCO2: { $avg: '$metrics.co2Level' }, avgHumidity: { $avg: '$metrics.humidity' }, avgSeaLevel: { $avg: '$metrics.seaLevel' } } }]),
    ClimateReading.countDocuments({ 'anomaly.detected': true }),
    ClimateReading.aggregate([
      { $match: { 'anomaly.detected': true } },
      { $group: { _id: '$country.isoCode', name: { $first: '$country.name' }, isoCode: { $first: '$country.isoCode' }, count: { $sum: 1 }, latestSeverity: { $first: '$anomaly.severity' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Alert.find({ status: 'active' }).sort({ createdAt: -1 }).limit(5).lean(),
  ])

  const avg = avgMetrics[0] || {}

  return {
    kpis: {
      totalReadings,
      totalCountries,
      activeAlerts,
      criticalAlerts,
      avgTemperature: +(avg.avgTemp || 0).toFixed(1),
      avgCO2: +(avg.avgCO2 || 0).toFixed(1),
      avgHumidity: +(avg.avgHumidity || 0).toFixed(1),
      avgSeaLevel: +(avg.avgSeaLevel || 0).toFixed(2),
      anomalyRate: totalReadings > 0 ? +((anomalyCount / totalReadings) * 100).toFixed(1) : 0,
    },
    recentReadings: JSON.parse(JSON.stringify(recentReadings)),
    topAnomalyCountries: JSON.parse(JSON.stringify(topAnomalyCountries)),
    recentAlerts: JSON.parse(JSON.stringify(recentAlertDocs)),
  }
}

export default async function DashboardPage() {
  const { kpis, recentReadings, topAnomalyCountries, recentAlerts } = await getDashboardData()

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Global climate monitoring overview"
      />

      <div className="space-y-6">
        <KPIStrip kpis={kpis} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Temperature Trend</CardTitle>
            </CardHeader>
            <TemperatureLineChart data={recentReadings} height={280} />
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>CO₂ Levels</CardTitle>
            </CardHeader>
            <CO2AreaChart data={recentReadings} height={280} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <TopCountriesByAnomaly countries={topAnomalyCountries} />
          <RecentAlerts alerts={recentAlerts} />
          <LiveFeedTicker />
        </div>
      </div>
    </>
  )
}
