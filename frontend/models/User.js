import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'viewer' },
  department: { type: String, default: '' },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, {
  timestamps: true,
  collection: 'users'
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
