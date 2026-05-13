# Productivity Flow Tracker (MERN + Chrome Extension)

A premium productivity tracking system that monitors web usage, blocks distractions, and provides detailed insights through a synchronized dashboard.

## 🚀 Features

- **Chrome Extension (V3)**:
  - Active tab tracking with smart duration calculation.
  - Dynamic site blocking using `declarativeNetRequest`.
  - Glassmorphism-styled popup for quick focus control.
- **Backend (Express/MongoDB)**:
  - RESTful API for activity logs and user preferences.
  - Aggregation pipelines for daily productivity stats.
- **Web Dashboard (React)**:
  - Interactive data visualization with Recharts.
  - Focus mode management and blocklist configuration.
  - Fluid animations with Framer Motion.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Framer Motion, Recharts, Lucide Icons.
- **Extension**: Manifest V3, JavaScript, CSS3.
- **Backend**: Node.js, Express.
- **Database**: MongoDB, Mongoose.

## 📦 Installation

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```

### 2. Dashboard Setup
```bash
cd client
npm install
npm run dev
```

### 3. Extension Setup
- Go to `chrome://extensions/`
- Enable **Developer Mode**.
- Click **Load unpacked** and select the `extension` folder.

## 📝 License
MIT
