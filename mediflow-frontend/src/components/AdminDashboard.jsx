import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Users, Trash2, Stethoscope, Sparkles, Briefcase, Mail, Calendar, Search,
  UserPlus, Plus, Edit3, Eye, ShieldAlert, ShieldCheck, BarChart3, TrendingUp,
} from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from '../stores/auth';
import usePolling from '../hooks/usePolling';
import useAnimatedCounter from '../hooks/useAnimatedCounter';
import UserFormModal from './admin/UserFormModal';
import UserDetailsModal from './admin/UserDetailsModal';

function StatCard({ label, value, icon: Icon, grad }) {
  const animated = useAnimatedCounter(typeof value === 'number' ? value : 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="stat-card"
    >
      <div className={`stat-icon ${grad}`}><Icon className="w-5 h-5" /></div>
      <div className="min-w-0">
        <div className="stat-value">{typeof value === 'number' ? animated : value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const me = useAuth((s) => s.user);

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('doctors');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formRole, setFormRole] = useState('doctor');
  const [editing, setEditing] = useState(null);
  const [details, setDetails] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [d, p, s] = await Promise.all([
        api.get('/admin/users', { params: { role: 'doctor', search: query || undefined } }),
        api.get('/admin/users', { params: { role: 'patient', search: query || undefined } }),
        api.get('/admin/statistics'),
      ]);
      setDoctors(Array.isArray(d.data) ? d.data : []);
      setPatients(Array.isArray(p.data) ? p.data : []);
      setStats(s.data || {});
      setLoading(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load admin data'));
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  usePolling(fetchAll, 10000, [query]);

  const initials = (name = '?') => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${u.id}`);
      toast.success(`${u.name} deleted`);
      fetchAll();
    } catch (e) { toast.error(getErrorMessage(e, 'Delete failed')); }
  };

  const handleToggleSuspend = async (u) => {
    const path = u.is_suspended ? `/admin/users/${u.id}/unsuspend` : `/admin/users/${u.id}/suspend`;
    try {
      await api.put(path);
      toast.success(u.is_suspended ? 'User unsuspended' : 'User suspended');
      fetchAll();
    } catch (e) { toast.error(getErrorMessage(e, 'Action failed')); }
  };

  const openCreate = (role) => { setFormMode('create'); setFormRole(role); setEditing(null); setFormOpen(true); };
  const openEdit = (user) => { setFormMode('edit'); setFormRole(user.role); setEditing(user); setFormOpen(true); };

  const list = activeTab === 'doctors' ? doctors : patients;

  return (
    <div className="page">
      <div className="page-container py-10 animate-fade-in">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-accent-800 to-brand-700 text-white p-8 sm:p-10 shadow-glow"
        >
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-accent-400/30 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" /> Admin console
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl font-bold">
                Welcome, {me?.name?.split(' ')[0] || 'Admin'}
              </h1>
              <p className="mt-2 max-w-xl text-white/80">
                Manage doctors, patients and overall platform health from one place.
              </p>
            </div>
            <button onClick={() => navigate('/admin-analytics')} className="btn bg-white text-brand-700 hover:bg-brand-50">
              <BarChart3 className="w-4 h-4" /> View analytics
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total doctors" value={stats.total_doctors ?? 0} icon={Stethoscope} grad="from-brand-500 to-accent-600" />
          <StatCard label="Total patients" value={stats.total_patients ?? 0} icon={Users} grad="from-emerald-500 to-brand-600" />
          <StatCard label="Appointments" value={stats.total_appointments ?? 0} icon={Calendar} grad="from-accent-500 to-fuchsia-500" />
          <StatCard label="Revenue ($)" value={Math.round(stats.total_revenue || 0)} icon={TrendingUp} grad="from-amber-500 to-rose-500" />
        </div>

        {/* Tabs + search */}
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div className="inline-flex p-1 rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 shadow-soft">
            {[
              { id: 'doctors', label: 'Doctors', count: doctors.length },
              { id: 'patients', label: 'Patients', count: patients.length },
            ].map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === t.id
                    ? 'bg-gradient-to-r from-brand-500 to-accent-600 text-white shadow-glow'
                    : 'text-ink-600 dark:text-ink-300 hover:text-brand-700'
                }`}>
                {t.label} <span className="ml-1 opacity-80">({t.count})</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="input-group w-full sm:w-72">
              <Search className="input-icon w-5 h-5" />
              <input className="input input-with-icon" placeholder={`Search ${activeTab}…`}
                value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <button onClick={() => openCreate(activeTab === 'doctors' ? 'doctor' : 'patient')} className="btn-primary">
              {activeTab === 'doctors' ? <Plus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              Add {activeTab === 'doctors' ? 'doctor' : 'patient'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 card overflow-hidden">
          {loading ? (
            <div className="p-12">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-lg shimmer" />
                ))}
              </div>
            </div>
          ) : list.length === 0 ? (
            <div className="p-12 text-center">
              {activeTab === 'doctors'
                ? <Stethoscope className="w-12 h-12 text-ink-300 mx-auto mb-3" />
                : <Users className="w-12 h-12 text-ink-300 mx-auto mb-3" />}
              <p className="text-ink-900 dark:text-white font-semibold">No {activeTab} found</p>
              <p className="text-sm text-ink-500">Use the “Add” button to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="table">
                <thead>
                  <tr>
                    <th>{activeTab === 'doctors' ? 'Doctor' : 'Patient'}</th>
                    {activeTab === 'doctors' && <th>Specialization</th>}
                    {activeTab === 'doctors' && <th>Experience</th>}
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <AnimatePresence component="tbody">
                  <tbody>
                    {list.map((u) => (
                      <motion.tr key={u.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${activeTab === 'doctors' ? 'from-brand-500 to-accent-600' : 'from-emerald-500 to-brand-600'} text-white grid place-items-center text-xs font-bold`}>
                              {initials(u.name)}
                            </div>
                            <span className="font-semibold text-ink-900 dark:text-white">{u.name}</span>
                          </div>
                        </td>
                        {activeTab === 'doctors' && (
                          <td><span className="badge-brand">{u.specialization || 'General'}</span></td>
                        )}
                        {activeTab === 'doctors' && (
                          <td><span className="inline-flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-ink-400" />{u.experience_years ?? 0} yrs</span></td>
                        )}
                        <td className="text-ink-600 dark:text-ink-300"><span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-ink-400" />{u.email}</span></td>
                        <td className="text-ink-600 dark:text-ink-300">{u.phone || '—'}</td>
                        <td>
                          {u.is_suspended
                            ? <span className="badge-danger"><ShieldAlert className="w-3 h-3" /> Suspended</span>
                            : <span className="badge-success"><ShieldCheck className="w-3 h-3" /> Active</span>}
                        </td>
                        <td className="text-right">
                          <div className="inline-flex gap-1">
                            <button onClick={() => setDetails(u)} className="btn-ghost btn-sm" title="View"><Eye className="w-3.5 h-3.5" /></button>
                            <button onClick={() => openEdit(u)} className="btn-secondary btn-sm" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleToggleSuspend(u)} className="btn-secondary btn-sm" title={u.is_suspended ? 'Unsuspend' : 'Suspend'}>
                              {u.is_suspended ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => handleDelete(u)} className="btn-danger btn-sm" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
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

      <UserFormModal
        open={formOpen} onClose={() => setFormOpen(false)}
        mode={formMode} role={formRole} initial={editing}
        onSaved={fetchAll}
      />
      <UserDetailsModal open={!!details} onClose={() => setDetails(null)} user={details} />
    </div>
  );
}
