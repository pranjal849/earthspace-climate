'use client'

import { useEffect, useState, useRef } from 'react'
import { getSocket, disconnectSocket } from '@/lib/socket'
import PageHeader from '@/components/layout/PageHeader'
import SensorCard from '@/components/realtime/SensorCard'
import LiveDataTable from '@/components/realtime/LiveDataTable'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import CountrySearchInput from '@/components/ui/CountrySearchInput'
import { Pause, Play, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAlertStore } from '@/store/useAlertStore'

export default function RealTimePage() {
  const [readings, setReadings] = useState([])
  const [sensorData, setSensorData] = useState({})
  const [connected, setConnected] = useState(false)
  const [paused, setPaused] = useState(false)
  const [miniChartData, setMiniChartData] = useState([])
  const [filterQuery, setFilterQuery] = useState('')
  const [countries, setCountries] = useState([])
  const { soundEnabled, toggleSound, addAlert } = useAlertStore()
  const socketRef = useRef(null)

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

  useEffect(() => {
    const socket = getSocket()
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('climate:reading', (reading) => {
      if (paused) return

      setReadings((prev) => [reading, ...prev].slice(0, 50))

      // Update sensor cards — keep latest per country
      setSensorData((prev) => ({
        ...prev,
        [reading.country?.isoCode]: reading,
      }))

      // Mini chart data (last 20 readings)
      setMiniChartData((prev) => [
        ...prev,
        {
          time: new Date(reading.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
          temp: reading.metrics?.temperature,
        },
      ].slice(-20))
    })

    socket.on('alert:new', (alert) => {
      addAlert(alert)
      if (soundEnabled) {
        try { new Audio('/ping.mp3').play().catch(() => {}) } catch {}
      }
    })

    return () => {
      socket.off('climate:reading')
      socket.off('alert:new')
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [paused, soundEnabled, addAlert])

  const sensorEntries = Object.entries(sensorData)
    .filter(([_, reading]) => !filterQuery || reading.country?.name.toLowerCase().includes(filterQuery.toLowerCase()))
    .slice(0, 4)

  const filteredReadings = filterQuery 
    ? readings.filter(r => r.country?.name.toLowerCase().includes(filterQuery.toLowerCase()))
    : readings

  return (
    <>
      <PageHeader title="Real-Time Monitor" description="Live climate data feed">
        <div className="flex items-center gap-2 flex-wrap">
          <CountrySearchInput
            value={filterQuery}
            onChange={setFilterQuery}
            onSelect={(country) => setFilterQuery(country ? country.name : '')}
            countries={countries}
            placeholder="Filter by country..."
            className="w-[220px]"
            size="sm"
          />
          <Badge variant={connected ? 'success' : 'danger'} dot>
            {connected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPaused(!paused)}
          >
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {paused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSound}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div>
      </PageHeader>

      <div className="space-y-6">
        {/* Sensor cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sensorEntries.map(([code, reading]) => (
            <SensorCard
              key={code}
              country={reading.country?.name}
              reading={reading}
              isOnline={connected}
            />
          ))}
          {sensorEntries.length === 0 && (
            [...Array(4)].map((_, i) => (
              <div key={i} className="card p-4">
                <p className="text-xs text-text-muted">Waiting for sensor data...</p>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Live data table */}
          <div className="lg:col-span-2">
            <LiveDataTable readings={filteredReadings} />
          </div>

          {/* Mini realtime chart */}
          <Card>
            <CardHeader>
              <CardTitle>Temperature (Last 60s)</CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={miniChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </>
  )
}
