import connectDB from '@/lib/db'
import ClimateReading from '@/models/ClimateReading'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import InteractiveWorldMap from '@/components/map/InteractiveWorldMap'

async function getMapData() {
  await connectDB()

  const countries = await ClimateReading.aggregate([
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: '$country.isoCode',
        name: { $first: '$country.name' },
        isoCode: { $first: '$country.isoCode' },
        region: { $first: '$country.region' },
        coordinates: { $first: '$country.coordinates' },
        latestReading: { $first: { temperature: '$metrics.temperature', co2Level: '$metrics.co2Level' } },
        latestAnomaly: { $first: '$anomaly' },
        avgTemperature: { $avg: '$metrics.temperature' },
        avgCO2: { $avg: '$metrics.co2Level' },
        anomalyCount: { $sum: { $cond: ['$anomaly.detected', 1, 0] } },
        readingCount: { $sum: 1 },
      },
    },
  ])

  return JSON.parse(JSON.stringify(countries))
}

export default async function MapPage() {
  const countries = await getMapData()

  return (
    <>
      <PageHeader
        title="Global Map"
        description="Interactive map of all monitored countries"
      />
      <Card padding={false} className="overflow-hidden">
        <InteractiveWorldMap
          countryData={countries}
          height={600}
          showLegend={true}
        />
      </Card>
    </>
  )
}
