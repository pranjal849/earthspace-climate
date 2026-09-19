'use client'

import Link from 'next/link'
import { Leaf } from 'lucide-react'
import LoginForm from '@/components/auth/LoginForm'
import InteractiveWorldMap from '@/components/map/InteractiveWorldMap'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — Map */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface border-r border-border flex-col relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <InteractiveWorldMap
            countryData={[]}
            autoHighlight={true}
            showLegend={false}
            height={600}
            className="w-full"
          />
        </div>

        {/* Floating stat cards */}
        <div className="absolute bottom-8 left-8 right-8 flex gap-3">
          <div className="bg-surface border border-border rounded-card p-3 shadow-card">
            <p className="text-xs text-text-muted">Global Avg</p>
            <p className="text-lg font-semibold text-text-primary tabular-nums">+1.2°C</p>
          </div>
          <div className="bg-surface border border-border rounded-card p-3 shadow-card">
            <p className="text-xs text-text-muted">CO₂</p>
            <p className="text-lg font-semibold text-text-primary tabular-nums">421 ppm</p>
          </div>
          <div className="bg-surface border border-border rounded-card p-3 shadow-card">
            <p className="text-xs text-text-muted">Sea Level</p>
            <p className="text-lg font-semibold text-text-primary tabular-nums">+3.7mm/yr</p>
          </div>
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-card bg-accent flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-text-primary">EarthScape</h1>
              <p className="text-xs text-text-muted">Climate Intelligence Platform</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-text-primary mb-1">Welcome back</h2>
          <p className="text-sm text-text-muted mb-6">Sign in to your account to continue</p>

          <LoginForm />

          <p className="text-sm text-text-muted text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-accent hover:underline font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
