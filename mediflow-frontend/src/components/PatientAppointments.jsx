import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Calendar, Clock, Stethoscope, FileText, XCircle, AlertCircle, Plus, CheckCircle2, RotateCcw,
} from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';
import usePolling from '../hooks/usePolling';
import Modal from './Modal';

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

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resched, setResched] = useState(null);
  const [reschedDate, setReschedDate] = useState('');
  const [reschedTime, setReschedTime] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get('/my-appointments');
      setAppointments(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to load appointments'));
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  usePolling(fetch, 10000);

  const cancel = async (a) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.delete(`/appointments/${a.id}`);
      toast.success('Appointment cancelled');
      fetch();
    } catch (e) { toast.error(getErrorMessage(e, 'Cancel failed')); }
  };

  useEffect(() => {
    if (!resched || !reschedDate) { setSlots([]); return; }
    const loadSlots = async () => {
      setSlotsLoading(true);
      try {
        const { data } = await api.get(`/doctors/${resched.doctor.id}/slots`, { params: { date: reschedDate } });
        setSlots(data.slots || []);
        setReschedTime('');
      } catch { setSlots([]); }
      finally { setSlotsLoading(false); }
    };
    loadSlots();
  }, [resched, reschedDate]);

  const doReschedule = async () => {
    if (!reschedTime) { toast.error('Pick a time slot'); return; }
    setSaving(true);
    try {
      await api.put(`/appointments/${resched.id}/reschedule`, {
        appointment_date: reschedDate, appointment_time: reschedTime,
      });
      toast.success('Appointment rescheduled');
      setResched(null); fetch();
    } catch (e) { toast.error(getErrorMessage(e, 'Reschedule failed')); }
    finally { setSaving(false); }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page">
      <div className="page-container py-10 animate-fade-in">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title">My appointments</h1>
            <p className="section-subtitle">Track upcoming visits, reschedule or cancel.</p>
          </div>
          <button onClick={() => navigate('/doctors')} className="btn-primary">
            <Plus className="w-4 h-4" /> Book new
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-28 shimmer rounded-2xl" />)}
          </div>
        ) : appointments.length === 0 ? (
          <div className="card-pad text-center">
            <div className="h-14 w-14 rounded-2xl bg-brand-100 dark:bg-brand-500/15 grid place-items-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-brand-700 dark:text-brand-300" />
            </div>
            <p className="text-ink-900 dark:text-white font-semibold">No appointments yet</p>
            <button onClick={() => navigate('/doctors')} className="btn-primary mt-4">
              <Plus className="w-4 h-4" /> Book appointment
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-5">
            <AnimatePresence>
              {appointments.map((a) => (
                <motion.div key={a.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="card p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-600 text-white grid place-items-center font-bold shadow-glow shrink-0">
                        {initials(a.doctor?.name)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-ink-900 dark:text-white truncate">{a.doctor?.name}</h3>
                        <p className="text-sm text-brand-700 dark:text-brand-300 flex items-center gap-1.5 mt-0.5 truncate">
                          <Stethoscope className="w-4 h-4 shrink-0" /> {a.doctor?.specialization || 'General'}
                        </p>
                      </div>
                    </div>
                    <span className={statusBadge(a.status)}>
                      {a.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      {(a.status || 'pending').toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-ink-600 dark:text-ink-300"><Calendar className="w-4 h-4 text-ink-400" />{a.date}</div>
                    <div className="flex items-center gap-2 text-ink-600 dark:text-ink-300"><Clock className="w-4 h-4 text-ink-400" />{a.time}</div>
                  </div>

                  {a.reason && (
                    <div className="mt-4 flex items-start gap-2 text-sm text-ink-600 dark:text-ink-300">
                      <FileText className="w-4 h-4 text-ink-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{a.reason}</span>
                    </div>
                  )}

                  {(a.status === 'pending' || a.status === 'confirmed') && (
                    <div className="mt-5 pt-5 border-t border-ink-100 dark:border-ink-800 flex gap-2">
                      <button onClick={() => { setResched(a); setReschedDate(''); setReschedTime(''); setSlots([]); }} className="btn-secondary btn-sm">
                        <RotateCcw className="w-3.5 h-3.5" /> Reschedule
                      </button>
                      <button onClick={() => cancel(a)} className="btn-danger btn-sm">
                        <XCircle className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <Modal open={!!resched} onClose={() => setResched(null)} title="Reschedule appointment"
          footer={
            <div className="flex justify-end gap-3">
              <button onClick={() => setResched(null)} className="btn-secondary">Cancel</button>
              <button onClick={doReschedule} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Confirm'}</button>
            </div>
          }>
          <div className="space-y-4">
            <div>
              <label className="label">New date</label>
              <input type="date" className="input" min={today} value={reschedDate} onChange={(e) => setReschedDate(e.target.value)} />
            </div>
            {reschedDate && (
              <div>
                <label className="label">Available slots</label>
                {slotsLoading ? (
                  <div className="grid grid-cols-4 gap-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 rounded-lg shimmer" />)}</div>
                ) : slots.length === 0 ? (
                  <div className="alert-warning"><AlertCircle className="w-4 h-4" /><div>Doctor isn't available that day.</div></div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((s) => (
                      <button key={s} type="button" onClick={() => setReschedTime(s)}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold border ${reschedTime === s ? 'bg-gradient-to-r from-brand-500 to-accent-600 text-white border-transparent' : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-700 hover:border-brand-400'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
