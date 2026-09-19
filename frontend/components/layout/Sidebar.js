'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard, Database, Globe, BrainCircuit, Radio,
  Bell, FileText, Map, Users, Settings, LifeBuoy,
  ClipboardList, ChevronLeft, ChevronRight, Leaf,
} from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'analyst', 'viewer'] },
  { label: 'Climate Data', href: '/climate-data', icon: Database, roles: ['admin', 'analyst', 'viewer'] },
  { label: 'Countries', href: '/countries', icon: Globe, roles: ['admin', 'analyst', 'viewer'] },
  { label: 'ML Predictions', href: '/analytics', icon: BrainCircuit, roles: ['admin', 'analyst'] },
  { label: 'Real-Time', href: '/real-time', icon: Radio, roles: ['admin', 'analyst', 'viewer'] },
  { label: 'Alerts', href: '/alerts', icon: Bell, roles: ['admin', 'analyst', 'viewer'] },
  { label: 'Reports', href: '/reports', icon: FileText, roles: ['admin', 'analyst'] },
  { label: 'Map', href: '/map', icon: Map, roles: ['admin', 'analyst', 'viewer'] },
  { type: 'divider', roles: ['admin'] },
  { label: 'Users', href: '/admin/users', icon: Users, roles: ['admin'] },
  { label: 'Audit Log', href: '/admin/audit-log', icon: ClipboardList, roles: ['admin'] },
  { label: 'Settings', href: '/admin/settings', icon: Settings, roles: ['admin'] },
  { type: 'divider', roles: ['admin', 'analyst', 'viewer'] },
  { label: 'Support', href: '/support', icon: LifeBuoy, roles: ['admin', 'analyst', 'viewer'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const userRole = session?.user?.role || 'viewer'

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-surface border-r border-border transition-all duration-200 z-40 flex flex-col ${
        sidebarCollapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-border">
        <div className="w-8 h-8 rounded-card bg-accent flex items-center justify-center flex-shrink-0">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="text-sm font-semibold text-text-primary truncate">
            EarthScape
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems
          .filter((item) => item.roles.includes(userRole))
          .map((item, idx) => {
            if (item.type === 'divider') {
              return <div key={idx} className="my-2 mx-2 border-t border-border" />
            }

            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-input text-sm transition-colors duration-100 mb-0.5 ${
                  isActive
                    ? 'bg-accent-light text-accent font-medium'
                    : 'text-text-muted hover:text-text-primary hover:bg-background'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-accent' : ''}`} />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-input text-text-muted hover:text-text-primary hover:bg-background transition-colors duration-150"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
