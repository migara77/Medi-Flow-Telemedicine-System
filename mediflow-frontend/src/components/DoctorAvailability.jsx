import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ArrowLeft, Save, Clock, Calendar as CalIcon } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DEFAULT_ROW = { start_time: '09:00', end_time: '17:00', slot_duration: 30, is_available: true };

export default function DoctorAvailability() {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(() => DAYS.map((d) => ({ day_of_week: d, ...DEFAULT_ROW })));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/doctor/availability');
        // Map any existing rows into the 7-day grid
        const map = Object.fromEntries(DAYS.map((d) => [d, { day_of_week: d, ...DEFAULT_ROW, is_available: false }]));
        (Array.isArray(data) ? data : []).forEach((row) => {
          if (map[row.day_of_week]) {
            map[row.day_of_week] = {
              day_of_week: row.day_of_week,
              start_time: (row.start_time || '09:00').slice(0, 5),
              end_time: (row.end_time || '17:00').slice(0, 5),
              slot_duration: row.slot_duration || 30,
              is_available: !!row.is_available,
            };
          }
        });
        // If no rows at all, default to weekdays on, weekends off
        if (!Array.isArray(data) || data.length === 0) {
          DAYS.forEach((d) => { map[d].is_available = !['Saturday','Sunday'].includes(d); });
        }
        setSchedule(DAYS.map((d) => map[d]));
      } catch (e) {
        toast.error(getErrorMessage(e, 'Failed to load schedule'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateRow = (i, patch) => {
    setSchedule((s) => s.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  };

  const save = async () => {
    // Validate
    for (const r of schedule) {
      if (r.is_available && r.start_time >= r.end_time) {
        toast.error(`${r.day_of_week}: end time must be after start.`);
        return;
      }
    }
    setSaving(true);
    try {
      await api.post('/doctor/availability', { schedule });
      toast.success('Working hours saved');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <button onClick={() => navigate('/doctor-dashboard')} className="btn-ghost btn-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="section-title">Working hours</h1>
            <p className="section-subtitle">Patients will only see appointment slots inside these hours.</p>
          </div>
          <button onClick={save} disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save schedule'}
          </button>
        </div>

        <div className="card-pad">
          {loading ? (
            <div className="space-y-3">
              {DAYS.map((d) => <div key={d} className="h-14 rounded-xl shimmer" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {schedule.map((row, i) => (
                <motion.div
                  key={row.day_of_week}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className={`rounded-2xl border ${row.is_available ? 'border-brand-200 bg-brand-50/40 dark:bg-brand-500/5 dark:border-brand-500/30' : 'border-ink-200 dark:border-ink-800 bg-ink-50/60 dark:bg-ink-900'} p-4`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-3 flex items-center gap-3">
                      <CalIcon className="w-5 h-5 text-brand-700" />
                      <span className="font-semibold text-ink-900 dark:text-white">{row.day_of_week}</span>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-ink-500">Start</label>
                      <input type="time" disabled={!row.is_available}
                        className="input mt-1" value={row.start_time}
                        onChange={(e) => updateRow(i, { start_time: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-ink-500">End</label>
                      <input type="time" disabled={!row.is_available}
                        className="input mt-1" value={row.end_time}
                        onChange={(e) => updateRow(i, { end_time: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-ink-500">Slot (min)</label>
                      <select disabled={!row.is_available}
                        className="select mt-1" value={row.slot_duration}
                        onChange={(e) => updateRow(i, { slot_duration: Number(e.target.value) })}>
                        {[15,20,30,45,60].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-3 flex md:justify-end">
                      <button type="button"
                        onClick={() => updateRow(i, { is_available: !row.is_available })}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${row.is_available ? 'bg-gradient-to-r from-brand-500 to-accent-600' : 'bg-ink-300 dark:bg-ink-700'}`}
                      >
                        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition ${row.is_available ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className="ml-3 text-sm text-ink-600 dark:text-ink-300">
                        {row.is_available ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <div className="mt-6 text-xs text-ink-500 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Schedule is replaced atomically each save.
          </div>
        </div>
      </div>
    </div>
  );
}
