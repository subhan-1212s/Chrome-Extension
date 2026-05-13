const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Activity = require('./models/Activity');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.post('/api/activity', async (req, res) => {
  try {
    const { userId, domain, startTime, endTime, duration } = req.body;
    const activity = new Activity({ userId, domain, startTime, endTime, duration });
    await activity.save();
    res.status(201).json({ message: 'Activity tracked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await Activity.aggregate([
      { $match: { userId } },
      { $group: { _id: '$domain', totalDuration: { $sum: '$duration' } } },
      { $sort: { totalDuration: -1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/preferences/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
        // Create user if doesn't exist for simplicity in this demo
        const newUser = new User({ email: req.params.email, blockedSites: [] });
        await newUser.save();
        return res.json(newUser);
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/preferences', async (req, res) => {
  try {
    const { email, blockedSites, focusMode } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { blockedSites, focusMode },
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
