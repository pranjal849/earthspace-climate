import mongoose from 'mongoose'

const ReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  countries: [{
    name: String,
    isoCode: String
  }],
  dateRange: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  summary: { type: String, default: '' },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  format: { type: String, default: 'pdf' },
  status: { type: String, default: 'completed' },
  fileUrl: { type: String, default: '' },
  metrics: {
    totalReadings: { type: Number, default: 0 },
    anomaliesDetected: { type: Number, default: 0 },
    avgTemperature: { type: Number, default: 0 },
    avgCO2: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  collection: 'reports'
})

export default mongoose.models.Report || mongoose.model('Report', ReportSchema)
