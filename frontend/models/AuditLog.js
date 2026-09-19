import mongoose from 'mongoose'

const AuditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: String, default: '' },
  details: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' }
}, {
  timestamps: true,
  collection: 'auditlogs'
})

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema)
