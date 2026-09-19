'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, User, ChevronDown } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import CountrySearchInput from '@/components/ui/CountrySearchInput'
import { useUIStore } from '@/store/useUIStore'

export default function Topbar() {
  const { data: session } = useSession()
  const { sidebarCollapsed } = useUIStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [countries, setCountries] = useState([])
  const router = useRouter()

  const user = session?.user

  // Fetch countries once on mount
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

  const handleCountrySelect = (country) => {
    if (country) {
      setSearchQuery('')
      router.push(`/countries?q=${encodeURIComponent(country.name)}`)
    } else {
      setSearchQuery('')
    }
  }

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-surface border-b border-border z-30 flex items-center justify-between px-6 transition-all duration-200 ${
        sidebarCollapsed ? 'left-[68px]' : 'left-[240px]'
      }`}
    >
      {/* Search with live country dropdown */}
      <CountrySearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        onSelect={handleCountrySelect}
        countries={countries}
        placeholder="Search countries..."
        className="max-w-md w-full"
        size="sm"
      />

      {/* Right side */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative p-2 rounded-input text-text-muted hover:text-text-primary hover:bg-background transition-colors duration-150">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative ml-2">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-input hover:bg-background transition-colors duration-150"
          >
            <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center">
              <User className="w-4 h-4 text-accent" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-text-primary leading-tight">{user?.name || 'User'}</p>
              <p className="text-xs text-text-muted capitalize">{user?.role || 'viewer'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden sm:block" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-card shadow-card z-50 py-1">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                  <p className="text-xs text-text-muted">{user?.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-background transition-colors duration-100"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
