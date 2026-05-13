const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  blockedSites: [{ type: String }],
  focusMode: { type: Boolean, default: false },
  dailyGoal: { type: Number, default: 480 }, // in minutes (8 hours)
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
