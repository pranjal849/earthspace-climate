import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
})

const SupportTicketSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, default: 'medium' },
  status: { type: String, default: 'open' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submittedByName: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedToName: { type: String, default: '' },
  messages: [MessageSchema],
  resolvedAt: Date
}, {
  timestamps: true,
  collection: 'supporttickets'
})

export default mongoose.models.SupportTicket || mongoose.model('SupportTicket', SupportTicketSchema)
