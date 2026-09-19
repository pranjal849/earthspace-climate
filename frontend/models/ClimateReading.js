import mongoose from 'mongoose'

const ClimateReadingSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  source: { type: String, required: true },
  country: {
    name: { type: String, required: true },
    isoCode: { type: String, required: true },
    region: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  metrics: {
    temperature: { type: Number, required: true },
    co2Level: { type: Number, required: true },
    humidity: Number,
    seaLevel: Number,
    precipitation: Number,
    windSpeed: Number,
    uvIndex: Number,
    airQualityIndex: Number
  },
  anomaly: {
    detected: { type: Boolean, default: false },
    severity: String,
    description: String
  },
  processed: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'climatereadings'
})

export default mongoose.models.ClimateReading || mongoose.model('ClimateReading', ClimateReadingSchema)
