import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Calendar, Users, ClipboardList, CheckCircle2, Clock, XCircle, Sparkles, FileText,
  CalendarDays,
} from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from '../stores/auth';
import usePolling from '../hooks/usePolling';
import useAnimatedCounter from '../hooks/useAnimatedCounter';

function StatCard({ label, value, icon: Icon, grad }) {
  const animated = useAnimatedCounter(value);
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className={`stat-icon ${grad}`}><Icon className="w-5 h-5" /></div>
      <div className="min-w-0">
        <div className="stat-value">{animated}</div>
        <div className="stat-label">{label}</div>
      </div>
    </motion.div>
  );
}

const statusBadge = (s) => {
  s = (s || '').toLowerCase();
  if (s === 'confirmed') return 'badge-success';
  if (s === 'pending') return 'badge-warning';
  if (s === 'cancelled') return 'badge-danger';
  if (s === 'completed') return 'badge-brand';
  return 'badge-muted';
};

const initials = (name = '?') =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const me = useAuth((s) => s.user);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [actingId, setActingId] = useState(null);

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get('/doctor-appointments');
      setAppointments(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to load appointments'));
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  usePolling(fetch, 10000);

  const filtered = appointments.filter((a) => filter === 'all' || a.status === filter);

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    patients: new Set(appointments.map((a) => a.patient?.id).filter(Boolean)).size,
  };

  const setStatus = async (a, status) => {
    setActingId(a.id);
    try {
      await api.put(`/appointments/${a.id}/status`, { status });
      const label = { confirmed: 'approved', cancelled: 'rejected', completed: 'completed' }[status] || status;
      toast.success(`Appointment ${label}`);
      fetch();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Action failed'));
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="page">
      <div className="page-container py-10 animate-fade-in">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700 text-white p-8 sm:p-10 shadow-glow"
        >
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-accent-400/30 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" /> Doctor portal
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl font-bold">
                Good day, Dr. {me?.name?.split(' ').pop() || ''}
              </h1>
              <p className="mt-2 max-w-xl text-white/80">
                Approve incoming appointments, manage your hours and issue prescriptions in a few clicks.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/doctor-availability')} className="btn bg-white text-brand-700 hover:bg-brand-50">
                <CalendarDays className="w-4 h-4" /> Working hours
              </button>
              <button onClick={() => navigate('/create-prescription')} className="btn bg-white/10 text-white hover:bg-white/20 backdrop-blur">
                <FileText className="w-4 h-4" /> New prescription
              </button>
              <button onClick={() => navigate('/doctor-prescriptions')} className="btn bg-white/10 text-white hover:bg-white/20 backdrop-blur">
                <ClipboardList className="w-4 h-4" /> My prescriptions
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total appointments" value={stats.total} icon={Calendar} grad="from-brand-500 to-accent-600" />
          <StatCard label="Pending review" value={stats.pending} icon={Clock} grad="from-amber-500 to-orange-500" />
          <StatCard label="Confirmed" value={stats.confirmed} icon={CheckCircle2} grad="from-emerald-500 to-brand-600" />
          <StatCard label="Unique patients" value={stats.patients} icon={Users} grad="from-fuchsia-500 to-accent-600" />
        </div>

        {/* Filter chips */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {['pending', 'confirmed', 'completed', 'cancelled', 'all'].map((status) => (
              <button key={status} onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === status
                    ? 'bg-gradient-to-r from-brand-500 to-accent-600 text-white shadow-glow'
                    : 'bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 text-ink-600 dark:text-ink-300 hover:border-brand-300'
                }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <span className="text-sm text-ink-500">{filtered.length} shown</span>
        </div>

        {/* List */}
        <div className="mt-4 card overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 rounded-xl shimmer" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-ink-300 mx-auto mb-3" />
              <p className="text-ink-900 dark:text-white font-semibold">No appointments</p>
              <p className="text-sm text-ink-500">Patients' bookings will show up here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <AnimatePresence component="tbody">
                  <tbody>
                    {filtered.map((a) => (
                      <motion.tr key={a.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-600 text-white grid place-items-center text-xs font-bold">
                              {initials(a.patient?.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-ink-900 dark:text-white">{a.patient?.name}</div>
                              <div className="text-xs text-ink-500">{a.patient?.phone || a.patient?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap">{a.date}</td>
                        <td className="whitespace-nowrap">{a.time}</td>
                        <td className="max-w-xs truncate">{a.reason || '—'}</td>
                        <td><span className={statusBadge(a.status)}>{(a.status || 'pending').toUpperCase()}</span></td>
                        <td className="text-right">
                          <div className="inline-flex gap-1">
                            {a.status === 'pending' && (
                              <>
                                <button disabled={actingId === a.id} onClick={() => setStatus(a, 'confirmed')} className="btn-success btn-sm" title="Approve">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button disabled={actingId === a.id} onClick={() => setStatus(a, 'cancelled')} className="btn-danger btn-sm" title="Reject">
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              </>
                            )}
                            {a.status === 'confirmed' && (
                              <button disabled={actingId === a.id} onClick={() => setStatus(a, 'completed')} className="btn-secondary btn-sm">
                                Mark complete
                              </button>
                            )}
                            <button onClick={() => navigate('/create-prescription', { state: { patientId: a.patient?.id, patientName: a.patient?.name } })} className="btn-ghost btn-sm" title="Prescription">
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </AnimatePresence>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
