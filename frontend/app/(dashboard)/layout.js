'use client'

import { SessionProvider } from 'next-auth/react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { useUIStore } from '@/store/useUIStore'

function DashboardShell({ children }) {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />
      <main
        className={`pt-16 transition-all duration-200 ${
          sidebarCollapsed ? 'ml-[68px]' : 'ml-[240px]'
        }`}
      >
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }) {
  return (
    <SessionProvider>
      <DashboardShell>
        {children}
      </DashboardShell>
    </SessionProvider>
  )
}
