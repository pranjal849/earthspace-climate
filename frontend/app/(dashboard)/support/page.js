import connectDB from '@/lib/db'
import SupportTicket from '@/models/SupportTicket'
import PageHeader from '@/components/layout/PageHeader'
import SupportClient from './SupportClient'

async function getTickets() {
  await connectDB()
  const tickets = await SupportTicket.find()
    .sort({ createdAt: -1 })
    .lean()
  return JSON.parse(JSON.stringify(tickets))
}

export default async function SupportPage() {
  const tickets = await getTickets()
  return (
    <>
      <PageHeader title="Support Center" description="Manage and track user support requests" />
      <SupportClient initialTickets={tickets} />
    </>
  )
}
