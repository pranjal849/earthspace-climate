'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input, { Textarea } from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { LifeBuoy, Plus, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const priorityVariant = { low: 'success', medium: 'warning', high: 'danger' }
const statusVariant = { open: 'danger', 'in_progress': 'warning', resolved: 'success', closed: 'neutral' }

export default function SupportClient({ initialTickets = [] }) {
  const { data: session } = useSession()
  const [tickets, setTickets] = useState(initialTickets)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'technical', priority: 'low', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTicket,
          user: { name: session?.user?.name, email: session?.user?.email },
        }),
      })
      const data = await res.json()
      if (data.success) {
        setTickets([data.data, ...tickets])
        setIsModalOpen(false)
        setNewTicket({ subject: '', category: 'technical', priority: 'low', message: '' })
        toast.success('Ticket created successfully')
      }
    } catch {
      toast.error('Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Ticket
        </Button>
      </div>

      <Card padding={false}>
        {tickets.length === 0 ? (
          <EmptyState icon={LifeBuoy} message="No support tickets yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Subject</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Priority</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-background transition-colors duration-100 cursor-pointer">
                    <td className="py-3 px-4 font-medium text-text-primary">{ticket.subject}</td>
                    <td className="py-3 px-4 capitalize text-text-muted">{ticket.category}</td>
                    <td className="py-3 px-4"><Badge variant={priorityVariant[ticket.priority]}>{ticket.priority}</Badge></td>
                    <td className="py-3 px-4"><Badge variant={statusVariant[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge></td>
                    <td className="py-3 px-4 text-xs text-text-muted tabular-nums">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Support Ticket">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Subject" required value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={newTicket.category}
              onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
              options={[{ value: 'technical', label: 'Technical Issue' }, { value: 'data_inquiry', label: 'Data Inquiry' }, { value: 'feature_request', label: 'Feature Request' }, { value: 'other', label: 'Other' }]}
            />
            <Select
              label="Priority"
              value={newTicket.priority}
              onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
              options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]}
            />
          </div>
          <Textarea label="Message" required value={newTicket.message} onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })} />
          <div className="flex justify-end pt-4">
            <Button type="submit" loading={loading}>Submit Ticket</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
