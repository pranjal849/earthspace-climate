import PageHeader from '@/components/layout/PageHeader'
import SettingsClient from './SettingsClient'

async function getSettings() {
  // Use absolute URL since this is called during SSR
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/admin/settings`, { cache: 'no-store' })
    const data = await res.json()
    return data.success ? data.data : null
  } catch (e) {
    return null
  }
}

export default async function AdminSettingsPage() {
  const settings = await getSettings()

  return (
    <>
      <PageHeader title="Platform Settings" description="Configure global platform thresholds and options" />
      {settings ? (
        <SettingsClient initialSettings={settings} />
      ) : (
        <p className="text-sm text-danger">Failed to load settings</p>
      )}
    </>
  )
}
