import connectDB from '@/lib/db'
import ClimateReading from '@/models/ClimateReading'
import PageHeader from '@/components/layout/PageHeader'
import CountryCard from '@/components/countries/CountryCard'
import InteractiveWorldMap from '@/components/map/InteractiveWorldMap'
import Card from '@/components/ui/Card'

async function getCountries() {
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
        latestReading: {
          $first: {
            timestamp: '$timestamp',
            temperature: '$metrics.temperature',
            co2Level: '$metrics.co2Level',
          },
        },
        latestAnomaly: { $first: '$anomaly' },
        readingCount: { $sum: 1 },
        avgTemperature: { $avg: '$metrics.temperature' },
        avgCO2: { $avg: '$metrics.co2Level' },
        anomalyCount: { $sum: { $cond: ['$anomaly.detected', 1, 0] } },
      },
    },
    { $sort: { name: 1 } },
  ])

  return JSON.parse(JSON.stringify(countries))
}

export default async function CountriesPage({ searchParams }) {
  const resolvedParams = await searchParams
  const q = resolvedParams?.q?.toLowerCase() || ''

  let countries = await getCountries()

  if (q) {
    countries = countries.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.isoCode.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q)
    )
  }

  return (
    <>
      <PageHeader
        title="Countries"
        description={q ? `Found ${countries.length} countries matching "${q}"` : `Monitoring ${countries.length} countries worldwide`}
      />

      <div className="space-y-6">
        <Card padding={false} className="overflow-hidden">
          <InteractiveWorldMap
            countryData={countries}
            height={350}
            showLegend={true}
          />
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {countries.map((country) => (
            <CountryCard key={country.isoCode || country._id} country={country} />
          ))}
        </div>
      </div>
    </>
  )
}
