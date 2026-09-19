'use client'

import Link from 'next/link'
import { Leaf } from 'lucide-react'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
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

        <h2 className="text-lg font-semibold text-text-primary mb-1">Create your account</h2>
        <p className="text-sm text-text-muted mb-6">Join EarthScape to monitor climate data</p>

        <RegisterForm />

        <p className="text-sm text-text-muted text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
