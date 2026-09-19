import mongoose from 'mongoose'

const AlertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, required: true },
  country: {
    name: { type: String, required: true },
    isoCode: { type: String, required: true }
  },
  metric: { type: String, required: true },
  threshold: { type: Number, required: true },
  currentValue: { type: Number, required: true },
  status: { type: String, default: 'active' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, default: '' }
}, {
  timestamps: true,
  collection: 'alerts'
})

export default mongoose.models.Alert || mongoose.model('Alert', AlertSchema)
