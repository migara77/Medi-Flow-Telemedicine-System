import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  ArrowLeft, AlertCircle, Mail, Lock, User, Stethoscope, Briefcase, UserPlus, ShieldCheck, Phone,
} from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: '',
    role: 'patient', specialization: '', experience_years: '', bio: '',
  });
  const [specializations, setSpecializations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/specializations');
        setSpecializations(Array.isArray(data) ? data : []);
      } catch {}
    };
    load();
  }, []);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = { ...form };
      if (payload.role !== 'doctor') {
        delete payload.specialization;
        delete payload.experience_years;
        delete payload.bio;
      }
      await api.post('/register', payload);
      toast.success('Account created — please sign in');
      navigate('/login');
    } catch (err) {
      const m = getErrorMessage(err, 'Registration failed');
      setError(m); toast.error(m);
    } finally { setLoading(false); }
  };

  const roleOptions = [
    { value: 'patient', label: 'Patient', icon: User, desc: 'Book appointments & manage care' },
    { value: 'doctor', label: 'Doctor', icon: Stethoscope, desc: 'Manage patients & prescriptions' },
  ];

  return (
    <div className="min-h-screen bg-page-mesh bg-ink-50 dark:bg-page-mesh-dark dark:bg-ink-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto animate-fade-in">
        <button onClick={() => navigate('/login')} className="btn-ghost btn-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <div className="card-pad">
          <div className="flex items-center gap-3 mb-2">
            <span className="brand-logo"><UserPlus className="w-5 h-5" /></span>
            <div>
              <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Create your account</h1>
              <p className="text-sm text-ink-500">Join MediFlow in less than a minute</p>
            </div>
          </div>

          {error && (<div className="alert-error mt-6"><AlertCircle className="w-5 h-5 mt-0.5 shrink-0" /><div>{error}</div></div>)}

          <div className="mt-6">
            <label className="label">I am a…</label>
            <div className="grid grid-cols-2 gap-3">
              {roleOptions.map((r) => {
                const Icon = r.icon; const active = form.role === r.value;
                return (
                  <button type="button" key={r.value} onClick={() => setField('role', r.value)}
                    className={`text-left p-4 rounded-xl border transition-all ${active ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-500/10 shadow-ring' : 'border-ink-200 dark:border-ink-700 hover:border-brand-300'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`h-10 w-10 rounded-lg grid place-items-center ${active ? 'bg-gradient-to-br from-brand-500 to-accent-600 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300'}`}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <div>
                        <div className="font-semibold text-ink-900 dark:text-white">{r.label}</div>
                        <div className="text-xs text-ink-500">{r.desc}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Full name</label>
                <div className="input-group">
                  <User className="input-icon w-5 h-5" />
                  <input className="input input-with-icon" required value={form.name} onChange={(e) => setField('name', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <div className="input-group">
                  <Mail className="input-icon w-5 h-5" />
                  <input type="email" className="input input-with-icon" required value={form.email} onChange={(e) => setField('email', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Phone</label>
                <div className="input-group">
                  <Phone className="input-icon w-5 h-5" />
                  <input className="input input-with-icon" required value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="input-group">
                  <Lock className="input-icon w-5 h-5" />
                  <input type="password" minLength={6} className="input input-with-icon" required value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder="At least 6 characters" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Confirm password</label>
                <div className="input-group">
                  <ShieldCheck className="input-icon w-5 h-5" />
                  <input type="password" minLength={6} className="input input-with-icon" required value={form.password_confirmation} onChange={(e) => setField('password_confirmation', e.target.value)} />
                </div>
              </div>
            </div>

            {form.role === 'doctor' && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-brand-100 dark:border-brand-500/30 bg-brand-50/60 dark:bg-brand-500/5 p-5 space-y-5">
                <div className="flex items-center gap-2 text-brand-800 dark:text-brand-300 font-semibold"><Stethoscope className="w-5 h-5" />Doctor details</div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Specialization</label>
                    {specializations.length > 0 ? (
                      <select className="select" required value={form.specialization}
                        onChange={(e) => setField('specialization', e.target.value)}>
                        <option value="">Select specialization</option>
                        {specializations.map((spec) => (
                          <option key={spec.id} value={spec.name}>{spec.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input className="input" required value={form.specialization}
                        onChange={(e) => setField('specialization', e.target.value)} placeholder="e.g. Cardiology" />
                    )}
                  </div>
                  <div>
                    <label className="label">Years of experience</label>
                    <div className="input-group">
                      <Briefcase className="input-icon w-5 h-5" />
                      <input type="number" min="0" required className="input input-with-icon" value={form.experience_years}
                        onChange={(e) => setField('experience_years', e.target.value)} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="btn-primary btn-block btn-lg">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
