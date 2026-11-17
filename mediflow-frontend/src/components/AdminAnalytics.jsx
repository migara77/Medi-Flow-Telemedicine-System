import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { ArrowLeft, TrendingUp, Calendar, CheckCircle2, XCircle, Clock, Users, Stethoscope, BarChart3, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../lib/api';
import usePolling from '../hooks/usePolling';
import useAnimatedCounter from '../hooks/useAnimatedCounter';
import { toast } from 'react-toastify';

const COLORS = ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];

function Kpi({ label, value, icon: Icon, grad }) {
  const animated = useAnimatedCounter(value);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className={`stat-icon ${grad}`}><Icon className="w-5 h-5" /></div>
      <div>
        <div className="stat-value">{animated}</div>
        <div className="stat-label">{label}</div>
      </div>
    </motion.div>
  );
}

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [s, a] = await Promise.all([
        api.get('/admin/statistics'),
        api.get('/admin/appointments'),
      ]);
      setStats(s.data);
      setAppointments(Array.isArray(a.data) ? a.data : []);
      setLoading(false);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to load analytics'));
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  usePolling(fetchAll, 15000);

  const daily = (stats?.daily_appointments || []).map((d) => ({
    day: new Date(d.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    count: d.count,
  }));

  const statusData = (stats?.status_breakdown || []).map((s) => ({ name: s.status, value: s.count }));

  // Top doctors by appointment count
  const topDoctors = (() => {
    const map = new Map();
    appointments.forEach((a) => {
      const key = a.doctor_name || 'Unknown';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 6);
  })();

  return (
    <div className="page">
      <div className="page-container py-10 animate-fade-in">
        <button onClick={() => navigate('/admin-dashboard')} className="btn-ghost btn-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to admin
        </button>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title">Analytics</h1>
            <p className="section-subtitle">Live platform metrics, refreshed every 15 seconds.</p>
          </div>
          <div className="badge-success"><Activity className="w-3.5 h-3.5" /> Live</div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi label="Total appointments" value={stats?.total_appointments ?? 0} icon={Calendar} grad="from-brand-500 to-accent-600" />
          <Kpi label="Confirmed" value={stats?.confirmed_appointments ?? 0} icon={CheckCircle2} grad="from-emerald-500 to-brand-600" />
          <Kpi label="Pending" value={stats?.pending_appointments ?? 0} icon={Clock} grad="from-amber-500 to-orange-500" />
          <Kpi label="Cancelled" value={stats?.cancelled_appointments ?? 0} icon={XCircle} grad="from-rose-500 to-fuchsia-500" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Kpi label="Doctors" value={stats?.total_doctors ?? 0} icon={Stethoscope} grad="from-brand-500 to-accent-600" />
          <Kpi label="Patients" value={stats?.total_patients ?? 0} icon={Users} grad="from-emerald-500 to-brand-600" />
          <Kpi label="Suspended users" value={stats?.suspended_users ?? 0} icon={XCircle} grad="from-rose-500 to-fuchsia-500" />
          <Kpi label="Revenue ($)" value={Math.round(stats?.total_revenue || 0)} icon={TrendingUp} grad="from-amber-500 to-rose-500" />
        </div>

        {/* Charts grid */}
        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-brand-700" />
              <h3 className="font-bold text-ink-900 dark:text-white">Appointments (last 14 days)</h3>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={daily}>
                  <defs>
                    <linearGradient id="cAppt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#0891b2" strokeWidth={2} fill="url(#cAppt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-accent-700" />
              <h3 className="font-bold text-ink-900 dark:text-white">Appointment status breakdown</h3>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-ink-900 dark:text-white">Top doctors by appointments</h3>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={topDoctors} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={140} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {loading && <div className="mt-6 text-center text-ink-500">Loading…</div>}
      </div>
    </div>
  );
}
