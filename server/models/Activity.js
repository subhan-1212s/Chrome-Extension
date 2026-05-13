const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: String, required: true }, // For now, we'll use a simple ID or email
  domain: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in seconds
  category: { type: String, default: 'Uncategorized' }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
