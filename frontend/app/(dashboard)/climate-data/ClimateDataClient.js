'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import CountrySearchInput from '@/components/ui/CountrySearchInput'
import { Database, Download, Filter } from 'lucide-react'

const severityVariant = { low: 'success', medium: 'warning', high: 'warning', critical: 'danger' }

export default function ClimateDataClient({ initialReadings = [], regions = [], countryCodes = [], total = 0 }) {
  const [readings, setReadings] = useState(initialReadings)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ region: '', country: '', source: '', anomalyOnly: false })
  const [loading, setLoading] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [countries, setCountries] = useState([])

  // Fetch countries for search dropdown
  useEffect(() => {
    async function loadCountries() {
      try {
        const res = await fetch('/api/countries')
        const json = await res.json()
        if (json.success) setCountries(json.data || [])
      } catch (err) {
        console.error('Error loading countries:', err)
      }
    }
    loadCountries()
  }, [])

  const fetchData = async (newPage = 1, newFilters = filters) => {
    setLoading(true)
    const params = new URLSearchParams({ page: newPage, limit: 50 })
    if (newFilters.region) params.set('region', newFilters.region)
    if (newFilters.country) params.set('country', newFilters.country)
    if (newFilters.source) params.set('source', newFilters.source)
    if (newFilters.anomalyOnly) params.set('anomalyOnly', 'true')

    try {
      const res = await fetch(`/api/climate-data?${params}`)
      const data = await res.json()
      if (data.success) {
        setReadings(data.data)
        setPage(newPage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCountrySelect = (country) => {
    const countryCode = country ? country.isoCode : ''
    setCountrySearch(country ? country.name : '')
    const f = { ...filters, country: countryCode }
    setFilters(f)
    fetchData(1, f)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="flex flex-wrap items-end gap-3 p-4">
        <div className="w-48">
          <label className="block text-xs font-semibold text-text-muted mb-1">Search Country</label>
          <CountrySearchInput
            value={countrySearch}
            onChange={setCountrySearch}
            onSelect={handleCountrySelect}
            countries={countries}
            placeholder="Search country..."
            size="sm"
          />
        </div>
        <Select
          label="Region"
          placeholder="All regions"
          options={regions.map((r) => ({ value: r, label: r }))}
          value={filters.region}
          onChange={(e) => {
            const f = { ...filters, region: e.target.value }
            setFilters(f)
            fetchData(1, f)
          }}
        />
        <Select
          label="Source"
          placeholder="All sources"
          options={['satellite', 'weather_station', 'sensor', 'manual'].map((s) => ({ value: s, label: s }))}
          value={filters.source}
          onChange={(e) => {
            const f = { ...filters, source: e.target.value }
            setFilters(f)
            fetchData(1, f)
          }}
        />
        <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer pb-1">
          <input
            type="checkbox"
            checked={filters.anomalyOnly}
            onChange={(e) => {
              const f = { ...filters, anomalyOnly: e.target.checked }
              setFilters(f)
              fetchData(1, f)
            }}
            className="rounded"
          />
          Anomalies only
        </label>
      </Card>

      {/* Data table */}
      <Card padding={false}>
        {readings.length === 0 ? (
          <EmptyState icon={Database} message="No readings match your filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Country</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Region</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Temp</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">CO₂</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Humidity</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Source</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {readings.map((r) => (
                  <tr key={r._id} className="hover:bg-background transition-colors duration-100">
                    <td className="py-2.5 px-4 text-xs text-text-muted tabular-nums">
                      {new Date(r.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-text-primary">{r.country?.name}</td>
                    <td className="py-2.5 px-4 text-text-muted">{r.country?.region}</td>
                    <td className="py-2.5 px-4 tabular-nums">{r.metrics?.temperature?.toFixed(1)}°C</td>
                    <td className="py-2.5 px-4 tabular-nums">{r.metrics?.co2Level?.toFixed(0)} ppm</td>
                    <td className="py-2.5 px-4 tabular-nums">{r.metrics?.humidity?.toFixed(0)}%</td>
                    <td className="py-2.5 px-4"><Badge variant="neutral">{r.source}</Badge></td>
                    <td className="py-2.5 px-4">
                      {r.anomaly?.detected ? (
                        <Badge variant={severityVariant[r.anomaly.severity]} dot>{r.anomaly.severity}</Badge>
                      ) : (
                        <Badge variant="success">Normal</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between py-3 px-4 border-t border-border">
          <p className="text-xs text-text-muted">Page {page}</p>
          <div className="flex gap-1">
            <Button variant="secondary" size="sm" onClick={() => fetchData(page - 1)} disabled={page <= 1 || loading}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" onClick={() => fetchData(page + 1)} disabled={readings.length < 50 || loading}>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
