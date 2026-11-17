import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Mail, User, Phone, Lock, MapPin, Calendar, Briefcase, FileText, Stethoscope } from 'lucide-react';
import Modal from '../Modal';
import { api, getErrorMessage } from '../../lib/api';

const defaults = {
  name: '', email: '', password: '', phone: '',
  address: '', date_of_birth: '', gender: '',
  bio: '',
  specialization: '', experience_years: '',
};

export default function UserFormModal({ open, onClose, mode = 'create', role = 'patient', initial = null, onSaved }) {
  const [form, setForm] = useState(defaults);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (mode === 'edit' && initial) {
      setForm({
        ...defaults,
        name: initial.name || '',
        email: initial.email || '',
        phone: initial.phone || '',
        address: initial.address || '',
        date_of_birth: initial.date_of_birth?.slice(0, 10) || '',
        gender: initial.gender || '',
        bio: initial.bio || '',
        specialization: initial.specialization || '',
        experience_years: initial.experience_years ?? '',
      });
    } else {
      setForm(defaults);
    }
  }, [open, mode, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      let res;
      if (mode === 'create') {
        const payload = {
          name: form.name, email: form.email, password: form.password, phone: form.phone,
          address: form.address || null, date_of_birth: form.date_of_birth || null, gender: form.gender || null,
        };
        if (role === 'doctor') {
          payload.specialization = form.specialization;
          payload.experience_years = Number(form.experience_years || 0);
          payload.bio = form.bio || null;
          res = await api.post('/admin/create-doctor', payload);
        } else {
          res = await api.post('/admin/create-patient', payload);
        }
        toast.success(`${role === 'doctor' ? 'Doctor' : 'Patient'} created`);
      } else {
        const payload = {
          name: form.name, email: form.email, phone: form.phone,
          address: form.address, date_of_birth: form.date_of_birth || null,
          gender: form.gender || null, bio: form.bio || null,
        };
        if (form.password) payload.password = form.password;
        if (role === 'doctor') {
          payload.specialization = form.specialization;
          payload.experience_years = Number(form.experience_years || 0);
        }
        res = await api.put(`/admin/users/${initial.id}`, payload);
        toast.success('Saved');
      }
      onSaved?.(res?.data?.user || res?.data);
      onClose?.();
    } catch (err) {
      const msg = getErrorMessage(err, 'Save failed');
      setError(msg); toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const title = `${mode === 'create' ? 'Add' : 'Edit'} ${role === 'doctor' ? 'doctor' : 'patient'}`;

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-2xl"
      footer={(
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" form="user-form" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : (mode === 'create' ? 'Create' : 'Save changes')}
          </button>
        </div>
      )}
    >
      <form id="user-form" onSubmit={submit} className="space-y-5">
        {error && <div className="alert-error">{error}</div>}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full name</label>
            <div className="input-group">
              <User className="input-icon w-5 h-5" />
              <input className="input input-with-icon" required value={form.name}
                onChange={(e) => set('name', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <div className="input-group">
              <Mail className="input-icon w-5 h-5" />
              <input type="email" className="input input-with-icon" required value={form.email}
                onChange={(e) => set('email', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Phone</label>
            <div className="input-group">
              <Phone className="input-icon w-5 h-5" />
              <input className="input input-with-icon" required={mode === 'create'} value={form.phone}
                onChange={(e) => set('phone', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">{mode === 'create' ? 'Password' : 'New password (optional)'}</label>
            <div className="input-group">
              <Lock className="input-icon w-5 h-5" />
              <input type="password" minLength={6} className="input input-with-icon"
                required={mode === 'create'} value={form.password}
                onChange={(e) => set('password', e.target.value)} placeholder="At least 6 characters" />
            </div>
          </div>
        </div>

        {role === 'doctor' && (
          <div className="grid sm:grid-cols-2 gap-4 rounded-2xl border border-brand-100 dark:border-brand-500/30 bg-brand-50/60 dark:bg-brand-500/5 p-4">
            <div>
              <label className="label">Specialization</label>
              <div className="input-group">
                <Stethoscope className="input-icon w-5 h-5" />
                <input className="input input-with-icon" required value={form.specialization}
                  onChange={(e) => set('specialization', e.target.value)} placeholder="Cardiology, etc." />
              </div>
            </div>
            <div>
              <label className="label">Years of experience</label>
              <div className="input-group">
                <Briefcase className="input-icon w-5 h-5" />
                <input type="number" min="0" className="input input-with-icon" required value={form.experience_years}
                  onChange={(e) => set('experience_years', e.target.value)} />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Bio</label>
              <div className="input-group">
                <FileText className="input-icon w-5 h-5" style={{ top: '1rem', transform: 'none' }} />
                <textarea rows="3" className="textarea input-with-icon" value={form.bio}
                  onChange={(e) => set('bio', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Date of birth</label>
            <div className="input-group">
              <Calendar className="input-icon w-5 h-5" />
              <input type="date" className="input input-with-icon" value={form.date_of_birth}
                onChange={(e) => set('date_of_birth', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Gender</label>
            <select className="select" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
              <option value="">—</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="sm:col-span-1">
            <label className="label">Address</label>
            <div className="input-group">
              <MapPin className="input-icon w-5 h-5" />
              <input className="input input-with-icon" value={form.address}
                onChange={(e) => set('address', e.target.value)} />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
