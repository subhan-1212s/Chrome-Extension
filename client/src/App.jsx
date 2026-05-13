import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Clock, Shield, Layout, Settings, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:5000/api';
const USER_ID = 'user_demo@example.com';

const App = () => {
  const [stats, setStats] = useState([]);
  const [preferences, setPreferences] = useState({ blockedSites: [], focusMode: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, prefRes] = await Promise.all([
        axios.get(`${API_URL}/stats/${USER_ID}`),
        axios.get(`${API_URL}/preferences/${USER_ID}`)
      ]);
      setStats(statsRes.data);
      setPreferences(prefRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const toggleFocusMode = async () => {
    try {
      const res = await axios.put(`${API_URL}/preferences`, {
        email: USER_ID,
        focusMode: !preferences.focusMode,
        blockedSites: preferences.blockedSites
      });
      setPreferences(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="animate-pulse text-2xl font-bold">Loading Productivity Flow...</div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight"
          >
            Productivity <span className="text-gradient">Dashboard</span>
          </motion.h1>
          <p className="text-slate-400 mt-2">Welcome back. Here's your focus summary.</p>
        </div>
        <button 
          onClick={toggleFocusMode}
          className={`btn ${preferences.focusMode ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'btn-primary'}`}
        >
          {preferences.focusMode ? 'Focus Mode Active' : 'Enable Focus Mode'}
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Clock className="text-indigo-500" />} 
          label="Total Tracked" 
          value={`${Math.floor(stats.reduce((acc, curr) => acc + curr.totalDuration, 0) / 60)}m`}
          trend="+12% from yesterday"
        />
        <StatCard 
          icon={<Shield className="text-emerald-500" />} 
          label="Blocked Attempts" 
          value="42" 
          trend="Saved 1.5h today"
        />
        <StatCard 
          icon={<Layout className="text-rose-500" />} 
          label="Top Distraction" 
          value={stats[0]?._id || 'None'} 
          trend="24% of your time"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Clock size={20} /> Time Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="_id" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="totalDuration" radius={[4, 4, 0, 0]}>
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Settings/Blocking Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card flex flex-col"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Settings size={20} /> Focus Preferences
          </h3>
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl">
              <div>
                <p className="font-medium">Auto-Block Distractions</p>
                <p className="text-sm text-slate-500">Block known social media sites automatically</p>
              </div>
              <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center px-1">
                <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="font-medium mb-3">Custom Blocklist</p>
              <div className="space-y-2">
                {preferences.blockedSites.length > 0 ? preferences.blockedSites.map((site, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-900/30 rounded-lg border border-slate-800">
                    <span>{site}</span>
                    <button className="text-rose-400 text-sm">Remove</button>
                  </div>
                )) : (
                  <p className="text-slate-500 italic">No sites blocked yet.</p>
                )}
              </div>
            </div>
          </div>
          <button className="w-full btn btn-primary mt-6">Update Settings</button>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-6"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-900/50 rounded-xl">
        {icon}
      </div>
      <ChevronRight size={16} className="text-slate-600" />
    </div>
    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</p>
    <h2 className="text-3xl font-bold mt-1">{value}</h2>
    <p className="text-emerald-400 text-xs mt-2 font-medium">{trend}</p>
  </motion.div>
);

export default App;
