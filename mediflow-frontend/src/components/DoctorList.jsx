import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Search, Stethoscope, Briefcase, Star, ArrowRight, AlertCircle } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';
import usePolling from '../hooks/usePolling';

const initials = (name = '?') =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function DoctorList() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/specializations')
      .then(({ data }) => setSpecializations(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const url = selectedSpec ? `/doctors/specialization/${selectedSpec}` : '/doctors';
      const { data } = await api.get(url);
      setDoctors(Array.isArray(data) ? data : []);
      setError(''); setLoading(false);
    } catch (e) {
      setError('Failed to load doctors');
      toast.error(getErrorMessage(e, 'Failed to load doctors'));
      setLoading(false);
    }
  }, [selectedSpec]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
  usePolling(fetchDoctors, 15000, [selectedSpec]);

  const filtered = doctors.filter((d) => (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="page">
      <div className="page-container py-10 animate-fade-in">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title">Find your specialist</h1>
            <p className="section-subtitle">Filter by specialization or search by name</p>
          </div>
          <div className="badge-brand">{filtered.length} doctors</div>
        </div>

        <div className="card p-5 sm:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Specialization</label>
              <select value={selectedSpec} onChange={(e) => setSelectedSpec(e.target.value)} className="select">
                <option value="">All specializations</option>
                {specializations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Search by name</label>
              <div className="input-group">
                <Search className="input-icon w-5 h-5" />
                <input className="input input-with-icon" placeholder="e.g. Dr. Patel"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert-error mb-6">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" /><div>{error}</div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-56 shimmer rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-pad text-center">
            <Stethoscope className="w-12 h-12 text-ink-300 mx-auto mb-3" />
            <p className="text-ink-900 dark:text-white font-semibold">No doctors found</p>
            <p className="text-sm text-ink-500 mt-1">Try a different specialization or clear your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((d, i) => (
                <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="card card-hover p-6 flex flex-col">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 text-white grid place-items-center text-lg font-bold shadow-glow shrink-0">
                      {initials(d.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-ink-900 dark:text-white truncate">{d.name}</h3>
                      <p className="text-sm text-brand-700 dark:text-brand-300 font-medium truncate">{d.specialization || 'General'}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 text-sm">
                    <span className="badge-muted"><Briefcase className="w-3.5 h-3.5" />{d.experience_years ?? 0} yrs exp</span>
                    <span className="badge-warning"><Star className="w-3.5 h-3.5" /> 4.8</span>
                  </div>

                  {d.bio && <p className="mt-3 text-sm text-ink-500 line-clamp-2">{d.bio}</p>}

                  <button onClick={() => navigate(`/book-appointment/${d.id}`)} className="btn-primary mt-5">
                    Book appointment <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
