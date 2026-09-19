import connectDB from '@/lib/db'
import User from '@/models/User'
import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Users, Shield, Eye, BarChart3 } from 'lucide-react'

async function getUsers() {
  await connectDB()
  const users = await User.find().sort({ createdAt: -1 }).lean()
  return JSON.parse(JSON.stringify(users))
}

const roleIcon = { admin: Shield, analyst: BarChart3, viewer: Eye }
const roleVariant = { admin: 'danger', analyst: 'warning', viewer: 'neutral' }

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <>
      <PageHeader title="User Management" description={`${users.length} registered users`} />

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Email</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Role</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Department</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-background transition-colors duration-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-xs font-medium text-accent">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-text-primary">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-muted">{user.email}</td>
                  <td className="py-3 px-4"><Badge variant={roleVariant[user.role]}>{user.role}</Badge></td>
                  <td className="py-3 px-4 text-text-muted">{user.department || '—'}</td>
                  <td className="py-3 px-4">
                    <Badge variant={user.isActive ? 'success' : 'danger'} dot>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-text-muted tabular-nums">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
