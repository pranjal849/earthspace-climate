'use client'

import { useState, useEffect, useRef } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import Card, { CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import CorrelationHeatmap from '@/components/charts/CorrelationHeatmap'
import PredictionChart from '@/components/charts/PredictionChart'
import Badge from '@/components/ui/Badge'
import CountrySearchInput from '@/components/ui/CountrySearchInput'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'

const METRIC_OPTIONS = [
  { value: 'temperature', label: 'Temperature (°C)' },
  { value: 'co2Level', label: 'CO₂ Levels (ppm)' },
  { value: 'humidity', label: 'Humidity (%)' },
  { value: 'seaLevel', label: 'Sea Level Rise (mm)' },
  { value: 'airQualityIndex', label: 'Air Quality Index (AQI)' },
]

const MONTH_OPTIONS = [
  { value: 6, label: '6 Months' },
  { value: 12, label: '12 Months (1 Year)' },
  { value: 24, label: '24 Months (2 Years)' },
  { value: 36, label: '36 Months (3 Years)' },
  { value: 48, label: '48 Months (4 Years)' },
  { value: 60, label: '60 Months (5 Years)' },
]

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('database') // 'database' or 'csv'

  // Database analytics state
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState('') // Empty string = Global
  const [selectedMetric, setSelectedMetric] = useState('temperature')
  const [forecastMonths, setForecastMonths] = useState(12)
  const [dbLoading, setDbLoading] = useState(false)
  const [dbError, setDbError] = useState('')
  const [dbData, setDbData] = useState(null)

  // Country search state
  const [countrySearch, setCountrySearch] = useState('')

  // CSV analytics state
  const [csvFile, setCsvFile] = useState(null)
  const [csvMonths, setCsvMonths] = useState(12)
  const [csvLoading, setCsvLoading] = useState(false)
  const [csvError, setCsvError] = useState('')
  const [csvData, setCsvData] = useState(null)
  const [selectedCsvMetric, setSelectedCsvMetric] = useState('')

  const fileInputRef = useRef(null)

  // Load countries on mount
  useEffect(() => {
    async function loadCountries() {
      try {
        const res = await fetch('/api/countries')
        const json = await res.json()
        if (json.success) {
          setCountries(json.data || [])
        }
      } catch (err) {
        console.error('Error loading countries:', err)
      }
    }
    loadCountries()
  }, [])

  // Handle selecting a country from search
  const handleCountrySelect = (country) => {
    if (country) {
      setSelectedCountry(country.isoCode)
      setCountrySearch(country.name)
    } else {
      setSelectedCountry('')
      setCountrySearch('')
    }
  }

  // Run Database analytics query
  const runDbAnalytics = async () => {
    setDbLoading(true)
    setDbError('')
    try {
      const url = `/api/analytics?metric=${selectedMetric}&months=${forecastMonths}${
        selectedCountry ? `&country=${selectedCountry}` : ''
      }`
      const res = await fetch(url)
      const json = await res.json()
      if (json.success) {
        setDbData(json.data)
      } else {
        setDbError(json.error || 'Failed to calculate database predictions')
      }
    } catch (err) {
      setDbError('Network error running prediction')
    } finally {
      setDbLoading(false)
    }
  }

  // Trigger Database analytics run when selections change
  useEffect(() => {
    runDbAnalytics()
  }, [selectedCountry, selectedMetric, forecastMonths])

  // Handle CSV file drop or select
  const handleCsvSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.name.endsWith('.csv')) {
        setCsvFile(file)
        setCsvError('')
      } else {
        setCsvError('Please select a valid CSV file (.csv)')
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (file.name.endsWith('.csv')) {
        setCsvFile(file)
        setCsvError('')
      } else {
        setCsvError('Please select a valid CSV file (.csv)')
      }
    }
  }

  // Trigger CSV Upload & Analytics execution
  const runCsvAnalytics = async (e) => {
    if (e) e.preventDefault()
    if (!csvFile) return

    setCsvLoading(true)
    setCsvError('')
    setCsvData(null)
    setSelectedCsvMetric('')

    const formData = new FormData()
    formData.append('file', csvFile)
    formData.append('months', csvMonths.toString())

    try {
      const res = await fetch('/api/analytics/predict-csv', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setCsvData(json.data)
        if (json.data.columns?.length > 0) {
          setSelectedCsvMetric(json.data.columns[0])
        }
      } else {
        setCsvError(json.detail || json.error || 'Failed to process CSV file')
      }
    } catch (err) {
      setCsvError('Network error uploading CSV file')
    } finally {
      setCsvLoading(false)
    }
  }

  // Helper colors for anomalies scatter chart
  const SEVERITY_COLORS = {
    low: '#3A6B52',
    medium: '#B5651D',
    high: '#D38A4D',
    critical: '#A8333D',
  }

  return (
    <>
      <PageHeader
        title="AI/ML Climate Predictions Studio"
        description="Run advanced predictive modeling on historical records or analyze your own custom climate datasets."
      />

      {/* Tabs Header */}
      <div className="flex border-b border-border mb-6">
        <button
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-[2px] ${
            activeTab === 'database'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('database')}
        >
          Global Database Forecasts
        </button>
        <button
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-[2px] ${
            activeTab === 'csv'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('csv')}
        >
          Custom CSV Upload Analytics
        </button>
      </div>

      {/* Tab Content 1: Database forecasts */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Config selector card */}
          <Card className="bg-surface border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Country Search */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Search Country/Region</label>
                <CountrySearchInput
                  value={countrySearch}
                  onChange={setCountrySearch}
                  onSelect={handleCountrySelect}
                  countries={countries}
                  placeholder="Type to search countries..."
                  showGlobal={true}
                  selectedIsoCode={selectedCountry}
                />
              </div>

              {/* Metric Select */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Climate Metric</label>
                <select
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                >
                  {METRIC_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Forecast Horizon Select */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Forecast Horizon</label>
                <select
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                  value={forecastMonths}
                  onChange={(e) => setForecastMonths(Number(e.target.value))}
                >
                  {MONTH_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Loader */}
          {dbLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <span className="mt-3 text-sm text-text-muted">Computing ML predictions...</span>
            </div>
          )}

          {/* Error message */}
          {dbError && (
            <div className="p-4 bg-danger-light text-danger border border-danger rounded-lg text-sm">
              {dbError}
            </div>
          )}

          {/* Results dashboard */}
          {!dbLoading && dbData && (
            <div className="space-y-6">
              {/* Dynamic Prediction Chart */}
              <Card className="bg-surface border border-border">
                <CardHeader>
                  <div>
                    <CardTitle className="text-base font-semibold text-text-primary">
                      {selectedCountry
                        ? `${countries.find((c) => c.isoCode === selectedCountry)?.name || selectedCountry} Forecast`
                        : 'Global Forecast'}
                      {' '}({METRIC_OPTIONS.find((o) => o.value === selectedMetric)?.label})
                    </CardTitle>
                    <CardDescription>Linear regression with 95% confidence bands</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        dbData.trend?.trend === 'increasing'
                          ? 'danger'
                          : dbData.trend?.trend === 'decreasing'
                          ? 'success'
                          : 'neutral'
                      }
                    >
                      {dbData.trend?.trend}
                    </Badge>
                    <Badge variant="neutral">R² = {dbData.trend?.regression?.r2?.toFixed(3) || 'N/A'}</Badge>
                  </div>
                </CardHeader>
                <div className="mt-4">
                  <PredictionChart
                    historical={dbData.historical || []}
                    predictions={dbData.trend?.predictions || []}
                    height={320}
                  />
                </div>
                {dbData.trend?.ratePerYear !== undefined && (
                  <p className="text-xs text-text-muted mt-3">
                    Calculated rate of change: {dbData.trend.ratePerYear > 0 ? '+' : ''}
                    {dbData.trend.ratePerYear}{selectedMetric === 'temperature' ? '°C' : selectedMetric === 'co2Level' ? ' ppm' : ''}/year ·
                    Confidence: <span className="font-semibold">{dbData.trend.confidence}</span>
                  </p>
                )}
              </Card>

              {/* Stats KPIs and Correlation Matrix Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ML Anomaly Stats */}
                <Card className="bg-surface border border-border">
                  <CardHeader>
                    <div>
                      <CardTitle className="text-base font-semibold text-text-primary">Anomaly Detection</CardTitle>
                      <CardDescription>Z-score analysis (threshold: 2σ)</CardDescription>
                    </div>
                    <Badge variant="neutral">{dbData.anomalies?.stats?.anomalyRate || 0}% anomaly rate</Badge>
                  </CardHeader>

                  <div className="grid grid-cols-3 gap-3 text-center my-6 py-4 bg-background rounded-lg border border-border">
                    <div>
                      <p className="text-xs text-text-muted">Mean Value</p>
                      <p className="text-base font-semibold text-text-primary tabular-nums mt-1">
                        {dbData.anomalies?.stats?.mean || 0}
                        {selectedMetric === 'temperature' ? '°C' : selectedMetric === 'co2Level' ? ' ppm' : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Standard Dev</p>
                      <p className="text-base font-semibold text-text-primary tabular-nums mt-1">
                        {dbData.anomalies?.stats?.stdDev || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Anomalies Detected</p>
                      <p className="text-base font-semibold text-text-primary tabular-nums mt-1">
                        {dbData.anomalies?.anomalies?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Anomaly list (Scrollable) */}
                  <h4 className="text-xs font-semibold text-text-muted mb-2">Recent Anomalies</h4>
                  {dbData.anomalies?.anomalies?.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto border border-border rounded-lg text-xs divide-y divide-border bg-background">
                      {dbData.anomalies.anomalies.map((a, idx) => (
                        <div key={idx} className="p-2.5 flex items-center justify-between">
                          <span className="text-text-primary font-medium">
                            Reading: <span className="font-semibold">{a.value}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-text-muted font-mono">Z: {a.zScore}</span>
                            <Badge
                              variant={
                                a.severity === 'critical' || a.severity === 'high'
                                  ? 'danger'
                                  : a.severity === 'medium'
                                  ? 'warning'
                                  : 'neutral'
                              }
                              className="text-[10px] py-0 px-1.5"
                            >
                              {a.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted text-center py-6 bg-background rounded-lg border border-border">
                      No anomalies detected in this range.
                    </p>
                  )}
                </Card>

                {/* Database correlations heatmap */}
                <Card className="bg-surface border border-border">
                  <CardHeader>
                    <div>
                      <CardTitle className="text-base font-semibold text-text-primary">Metric Correlations</CardTitle>
                      <CardDescription>Pearson correlation coefficients</CardDescription>
                    </div>
                    <Badge variant="neutral">
                      {dbData.correlation?.insights?.strongCount || 0} strong pairs
                    </Badge>
                  </CardHeader>
                  <div className="mt-4">
                    <CorrelationHeatmap
                      matrix={dbData.correlation?.matrix || {}}
                      metrics={dbData.correlation?.metrics || []}
                    />
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Custom CSV Studio */}
      {activeTab === 'csv' && (
        <div className="space-y-6">
          {/* CSV File Upload Section */}
          <Card className="bg-surface border border-border">
            <form onSubmit={runCsvAnalytics} className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent transition-colors bg-background flex flex-col items-center justify-center"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCsvSelect}
                  accept=".csv"
                  className="hidden"
                />
                <svg
                  className="w-10 h-10 text-text-muted mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                {csvFile ? (
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{csvFile.name}</p>
                    <p className="text-xs text-text-muted mt-1">{(csvFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Click to select or drag and drop your CSV file</p>
                    <p className="text-xs text-text-muted mt-1">Files must end with .csv format</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-end gap-4 justify-between pt-2">
                <div className="w-full md:w-64">
                  <label className="block text-xs font-semibold text-text-muted mb-1">Forecast Horizon</label>
                  <select
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                    value={csvMonths}
                    onChange={(e) => setCsvMonths(Number(e.target.value))}
                  >
                    {MONTH_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  {csvFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setCsvFile(null)
                        setCsvData(null)
                        setCsvError('')
                      }}
                      className="px-4 py-2 border border-border text-text-primary hover:bg-surface text-sm font-semibold rounded-lg w-full md:w-auto"
                    >
                      Clear File
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={csvLoading || !csvFile}
                    className="px-6 py-2 bg-accent text-white hover:bg-accent/90 disabled:opacity-50 text-sm font-semibold rounded-lg w-full md:w-auto flex items-center justify-center gap-2"
                  >
                    {csvLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      'Analyze & Predict'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </Card>

          {/* Loader or Error */}
          {csvError && (
            <div className="p-4 bg-danger-light text-danger border border-danger rounded-lg text-sm">
              {csvError}
            </div>
          )}

          {/* Template instructions if no data yet */}
          {!csvLoading && !csvData && (
            <Card className="bg-surface border border-border p-6">
              <h3 className="text-sm font-semibold text-text-primary mb-3">CSV File Formatting Guidelines</h3>
              <p className="text-xs text-text-muted mb-4 leading-relaxed">
                To run successful predictive modeling and anomaly detection, your uploaded CSV file should have a header row and follow these specifications:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-muted">
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">Required Columns:</h4>
                  <ul className="list-disc pl-4 space-y-1.5 mt-1">
                    <li>
                      <span className="font-semibold text-text-primary">Date/Timestamp</span>: Named one of: 
                      <code className="bg-background px-1 py-0.5 rounded border border-border ml-1">date</code>, 
                      <code className="bg-background px-1 py-0.5 rounded border border-border ml-1">timestamp</code>, 
                      <code className="bg-background px-1 py-0.5 rounded border border-border ml-1">year</code>. 
                      Formats supported: <code className="text-text-primary">YYYY-MM-DD</code> or raw years.
                    </li>
                    <li>
                      <span className="font-semibold text-text-primary">Numeric Values</span>: Any additional columns containing numeric data (e.g. 
                      <code className="bg-background px-1 py-0.5 rounded border border-border ml-1">temperature</code>, 
                      <code className="bg-background px-1 py-0.5 rounded border border-border ml-1">co2</code>) will be auto-detected and analyzed as separate metrics.
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">Example Structure:</h4>
                  <pre className="bg-background p-3 rounded-lg border border-border font-mono mt-1 text-[11px] leading-relaxed">
                    date,temperature,co2Level{'\n'}
                    2024-01-01,15.2,410.5{'\n'}
                    2024-02-01,15.8,411.2{'\n'}
                    2024-03-01,16.4,411.8{'\n'}
                    2024-04-01,17.1,412.5
                  </pre>
                </div>
              </div>
            </Card>
          )}

          {/* CSV Results Dashboard */}
          {!csvLoading && csvData && (
            <div className="space-y-6">
              {/* Selector for parsed metric columns in the CSV */}
              <Card className="bg-surface border border-border">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1">Select CSV Column to View</label>
                  <select
                    className="w-full md:w-64 bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent font-semibold"
                    value={selectedCsvMetric}
                    onChange={(e) => setSelectedCsvMetric(e.target.value)}
                  >
                    {csvData.columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </Card>

              {/* Render Selected Metric Analytics */}
              {selectedCsvMetric && csvData.results[selectedCsvMetric] && (
                <div className="space-y-6">
                  {/* CSV Prediction Chart */}
                  <Card className="bg-surface border border-border">
                    <CardHeader>
                      <div>
                        <CardTitle className="text-base font-semibold text-text-primary">
                          Custom CSV Analysis — {selectedCsvMetric}
                        </CardTitle>
                        <CardDescription>Linear regression and confidence interval bands on your uploaded data</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            csvData.results[selectedCsvMetric].trend?.trend === 'increasing'
                              ? 'danger'
                              : csvData.results[selectedCsvMetric].trend?.trend === 'decreasing'
                              ? 'success'
                              : 'neutral'
                          }
                        >
                          {csvData.results[selectedCsvMetric].trend?.trend}
                        </Badge>
                        <Badge variant="neutral">
                          R² = {csvData.results[selectedCsvMetric].trend?.regression?.r2?.toFixed(3) || 'N/A'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <div className="mt-4">
                      <PredictionChart
                        historical={csvData.results[selectedCsvMetric].historical || []}
                        predictions={csvData.results[selectedCsvMetric].trend?.predictions || []}
                        height={320}
                      />
                    </div>
                    {csvData.results[selectedCsvMetric].trend?.ratePerYear !== undefined && (
                      <p className="text-xs text-text-muted mt-3">
                        Calculated annual rate of change: <span className="font-semibold text-text-primary">{csvData.results[selectedCsvMetric].trend.ratePerYear > 0 ? '+' : ''}{csvData.results[selectedCsvMetric].trend.ratePerYear}</span> units/year · 
                        Model Fit Confidence: <span className="font-semibold text-text-primary">{csvData.results[selectedCsvMetric].trend.confidence}</span>
                      </p>
                    )}
                  </Card>

                  {/* Anomaly list & Pearson correlations */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* CSV Anomaly Detection */}
                    <Card className="bg-surface border border-border">
                      <CardHeader>
                        <div>
                          <CardTitle className="text-base font-semibold text-text-primary">Anomaly Detection</CardTitle>
                          <CardDescription>Outliers detected in uploaded metric column</CardDescription>
                        </div>
                        <Badge variant="neutral">
                          {csvData.results[selectedCsvMetric].anomalies?.stats?.anomalyRate || 0}% anomaly rate
                        </Badge>
                      </CardHeader>

                      <div className="grid grid-cols-3 gap-3 text-center my-6 py-4 bg-background rounded-lg border border-border">
                        <div>
                          <p className="text-xs text-text-muted">Mean Value</p>
                          <p className="text-base font-semibold text-text-primary tabular-nums mt-1">
                            {csvData.results[selectedCsvMetric].anomalies?.stats?.mean || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted">Standard Dev</p>
                          <p className="text-base font-semibold text-text-primary tabular-nums mt-1">
                            {csvData.results[selectedCsvMetric].anomalies?.stats?.stdDev || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted">Outliers Count</p>
                          <p className="text-base font-semibold text-text-primary tabular-nums mt-1">
                            {csvData.results[selectedCsvMetric].anomalies?.anomalies?.length || 0}
                          </p>
                        </div>
                      </div>

                      <h4 className="text-xs font-semibold text-text-muted mb-2">Detected CSV Outliers</h4>
                      {csvData.results[selectedCsvMetric].anomalies?.anomalies?.length > 0 ? (
                        <div className="max-h-48 overflow-y-auto border border-border rounded-lg text-xs divide-y divide-border bg-background">
                          {csvData.results[selectedCsvMetric].anomalies.anomalies.map((a, idx) => (
                            <div key={idx} className="p-2.5 flex items-center justify-between">
                              <span className="text-text-primary font-medium">
                                Reading Index: {a.index} (Value: <span className="font-semibold">{a.value}</span>)
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-text-muted font-mono">Z: {a.zScore}</span>
                                <Badge
                                  variant={
                                    a.severity === 'critical' || a.severity === 'high'
                                      ? 'danger'
                                      : a.severity === 'medium'
                                      ? 'warning'
                                      : 'neutral'
                                  }
                                  className="text-[10px] py-0 px-1.5"
                                >
                                  {a.severity}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-text-muted text-center py-6 bg-background rounded-lg border border-border">
                          No outliers detected.
                        </p>
                      )}
                    </Card>

                    {/* CSV Pearson correlation heatmap */}
                    <Card className="bg-surface border border-border">
                      <CardHeader>
                        <div>
                          <CardTitle className="text-base font-semibold text-text-primary">Metric Correlations</CardTitle>
                          <CardDescription>Correlation matrix between all CSV numeric columns</CardDescription>
                        </div>
                      </CardHeader>
                      <div className="mt-4">
                        {Object.keys(csvData.correlation).length > 0 ? (
                          <CorrelationHeatmap
                            matrix={csvData.correlation}
                            metrics={csvData.columns}
                          />
                        ) : (
                          <p className="text-xs text-text-muted text-center py-12 bg-background rounded-lg border border-border">
                            Upload a CSV with multiple numeric columns to calculate correlations.
                          </p>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}
