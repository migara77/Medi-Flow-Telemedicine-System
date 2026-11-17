import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Pill, X, Calendar, Stethoscope, ChevronRight, Download } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';
import usePolling from '../hooks/usePolling';
import { downloadPrescriptionPdf } from '../lib/pdf';

export default function MyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const { data } = await api.get('/my-prescriptions');
      setPrescriptions(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to load prescriptions'));
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  usePolling(fetch, 15000);

  return (
    <div className="page">
      <div className="page-container py-10 animate-fade-in">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title">My prescriptions</h1>
            <p className="section-subtitle">Your digital prescription history</p>
          </div>
          <div className="badge-brand">{prescriptions.length} total</div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-32 shimmer rounded-2xl" />)}
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="card-pad text-center">
            <div className="h-14 w-14 rounded-2xl bg-brand-100 dark:bg-brand-500/15 grid place-items-center mx-auto mb-4">
              <Pill className="w-7 h-7 text-brand-700 dark:text-brand-300" />
            </div>
            <p className="text-ink-900 dark:text-white font-semibold">No prescriptions yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {prescriptions.map((p) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="card card-hover p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-brand-600 text-white grid place-items-center shadow-glow shrink-0">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-ink-900 dark:text-white truncate">{p.doctor?.name}</h3>
                    <p className="text-sm text-ink-500 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-4 h-4" /> {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {p.medications?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.medications.slice(0, 3).map((m, i) => (<span key={i} className="badge-muted">{m.name}</span>))}
                    {p.medications.length > 3 && <span className="badge-muted">+{p.medications.length - 3} more</span>}
                  </div>
                )}
                <div className="mt-5 flex justify-between items-center">
                  <button onClick={() => setSelected(p)} className="text-sm font-semibold text-brand-700 inline-flex items-center gap-1">
                    View details <ChevronRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => downloadPrescriptionPdf(p)} className="btn-secondary btn-sm">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selected && (
          <div className="modal-backdrop" onClick={() => setSelected(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white dark:bg-ink-900 border-b border-ink-100 dark:border-ink-800 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink-900 dark:text-white">Prescription details</h2>
                <button onClick={() => setSelected(null)} className="text-ink-400 hover:text-ink-900 p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-ink-50 dark:bg-ink-800 p-3">
                    <div className="text-xs uppercase tracking-wider text-ink-500 font-semibold">Doctor</div>
                    <div className="mt-1 font-semibold text-ink-900 dark:text-white inline-flex items-center gap-2"><Stethoscope className="w-4 h-4 text-brand-700" />{selected.doctor?.name}</div>
                  </div>
                  <div className="rounded-xl bg-ink-50 dark:bg-ink-800 p-3">
                    <div className="text-xs uppercase tracking-wider text-ink-500 font-semibold">Date</div>
                    <div className="mt-1 font-semibold text-ink-900 dark:text-white inline-flex items-center gap-2"><Calendar className="w-4 h-4 text-brand-700" />{new Date(selected.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wider text-ink-500 font-semibold mb-2">Medications</div>
                  <div className="space-y-2">
                    {selected.medications.map((m, i) => (
                      <div key={i} className="rounded-xl border border-ink-100 dark:border-ink-800 p-4 flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-brand-100 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 grid place-items-center"><Pill className="w-4 h-4" /></div>
                        <div>
                          <p className="font-semibold text-ink-900 dark:text-white">{m.name}</p>
                          <p className="text-sm text-ink-600 dark:text-ink-300">Dosage: {m.dosage} · Frequency: {m.frequency || '—'} · Duration: {m.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selected.instructions && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-ink-500 font-semibold mb-2">Instructions</div>
                    <p className="text-sm text-ink-700 dark:text-ink-200">{selected.instructions}</p>
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 bg-white dark:bg-ink-900 border-t border-ink-100 dark:border-ink-800 px-6 py-4 flex gap-2">
                <button onClick={() => downloadPrescriptionPdf(selected)} className="btn-primary"><Download className="w-4 h-4" /> Download PDF</button>
                <button onClick={() => setSelected(null)} className="btn-secondary">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
