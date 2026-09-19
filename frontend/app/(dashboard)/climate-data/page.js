import connectDB from '@/lib/db'
import ClimateReading from '@/models/ClimateReading'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import ClimateDataClient from './ClimateDataClient'

async function getClimateData() {
  await connectDB()

  const readings = await ClimateReading.find()
    .sort({ timestamp: -1 })
    .limit(50)
    .lean()

  const regions = await ClimateReading.distinct('country.region')
  const countries = await ClimateReading.distinct('country.isoCode')

  return {
    readings: JSON.parse(JSON.stringify(readings)),
    regions,
    countries,
    total: await ClimateReading.countDocuments(),
  }
}

export default async function ClimateDataPage() {
  const { readings, regions, countries, total } = await getClimateData()

  return (
    <>
      <PageHeader
        title="Climate Data"
        description={`${total} total readings across ${countries.length} countries`}
      />
      <ClimateDataClient
        initialReadings={readings}
        regions={regions}
        countryCodes={countries}
        total={total}
      />
    </>
  )
}
