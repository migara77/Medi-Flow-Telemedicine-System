import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar as CalendarIcon, Save, ArrowLeft, Lock, FileText } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from '../stores/auth';

export default function PatientProfile() {
  const navigate = useNavigate();
  const setUser = useAuth((s) => s.setUser);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', date_of_birth: '', gender: '', bio: '', password: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/profile');
        setForm({
          name: data.name || '', email: data.email || '', phone: data.phone || '',
          address: data.address || '', date_of_birth: data.date_of_birth?.slice(0, 10) || '',
          gender: data.gender || '', bio: data.bio || '', password: '',
        });
      } catch (e) {
        toast.error(getErrorMessage(e, 'Failed to load profile'));
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      delete payload.email; // email isn't updatable via profile
      const { data } = await api.put('/profile', payload);
      toast.success('Profile updated');
      setUser({ ...(JSON.parse(localStorage.getItem('user') || '{}')), ...data.user });
    } catch (e) {
      toast.error(getErrorMessage(e, 'Update failed'));
    } finally { setSaving(false); }
  };

  return (
    <div className="page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <button onClick={() => navigate(-1)} className="btn-ghost btn-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="brand-logo"><User className="w-5 h-5" /></span>
          <div>
            <h1 className="text-2xl font-bold text-ink-900 dark:text-white">My profile</h1>
            <p className="text-sm text-ink-500">Keep your details up to date.</p>
          </div>
        </div>

        {loading ? (
          <div className="card-pad space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 rounded-xl shimmer" />)}
          </div>
        ) : (
          <motion.form initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            onSubmit={submit} className="card-pad space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Name</label>
                <div className="input-group">
                  <User className="input-icon w-5 h-5" />
                  <input className="input input-with-icon" required value={form.name} onChange={(e) => setField('name', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <div className="input-group">
                  <Mail className="input-icon w-5 h-5" />
                  <input type="email" disabled className="input input-with-icon opacity-60 cursor-not-allowed" value={form.email} />
                </div>
              </div>
              <div>
                <label className="label">Phone</label>
                <div className="input-group">
                  <Phone className="input-icon w-5 h-5" />
                  <input className="input input-with-icon" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Date of birth</label>
                <div className="input-group">
                  <CalendarIcon className="input-icon w-5 h-5" />
                  <input type="date" className="input input-with-icon" value={form.date_of_birth} onChange={(e) => setField('date_of_birth', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="select" value={form.gender} onChange={(e) => setField('gender', e.target.value)}>
                  <option value="">—</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Address</label>
                <div className="input-group">
                  <MapPin className="input-icon w-5 h-5" />
                  <input className="input input-with-icon" value={form.address} onChange={(e) => setField('address', e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Bio</label>
              <div className="input-group">
                <FileText className="input-icon w-5 h-5" style={{ top: '1rem', transform: 'none' }} />
                <textarea rows="3" className="textarea input-with-icon" value={form.bio} onChange={(e) => setField('bio', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">New password (optional)</label>
              <div className="input-group">
                <Lock className="input-icon w-5 h-5" />
                <input type="password" minLength={6} className="input input-with-icon" value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder="Leave blank to keep current" />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary btn-lg btn-block">
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save changes'}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
}
