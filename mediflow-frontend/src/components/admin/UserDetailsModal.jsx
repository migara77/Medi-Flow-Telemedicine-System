import React from 'react';
import Modal from '../Modal';
import { Mail, Phone, MapPin, Calendar, Stethoscope, Briefcase, User as UserIcon, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function UserDetailsModal({ open, onClose, user }) {
  if (!user) return null;
  const initials = (user.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const rows = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone || '—' },
    { icon: MapPin, label: 'Address', value: user.address || '—' },
    { icon: Calendar, label: 'Date of birth', value: user.date_of_birth || '—' },
    { icon: UserIcon, label: 'Gender', value: user.gender || '—' },
  ];
  if (user.role === 'doctor') {
    rows.push({ icon: Stethoscope, label: 'Specialization', value: user.specialization || 'General' });
    rows.push({ icon: Briefcase, label: 'Experience', value: `${user.experience_years ?? 0} yrs` });
  }

  return (
    <Modal open={open} onClose={onClose} title="User details" maxWidth="max-w-xl">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 text-white grid place-items-center text-lg font-bold shadow-glow">
          {initials}
        </div>
        <div>
          <h3 className="text-xl font-bold text-ink-900 dark:text-white">{user.name}</h3>
          <p className="text-sm text-brand-700 dark:text-brand-300 capitalize">{user.role}</p>
          <div className="mt-2 flex gap-2">
            {user.is_suspended
              ? <span className="badge-danger"><ShieldAlert className="w-3 h-3" /> Suspended</span>
              : <span className="badge-success"><ShieldCheck className="w-3 h-3" /> Active</span>}
          </div>
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {rows.map((r, i) => {
          const Icon = r.icon;
          return (
            <div key={i} className="rounded-xl bg-ink-50 dark:bg-ink-800 p-3 flex items-start gap-3">
              <Icon className="w-4 h-4 text-brand-700 dark:text-brand-300 mt-0.5" />
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-500 font-semibold">{r.label}</div>
                <div className="text-sm font-medium text-ink-900 dark:text-white break-words">{r.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {user.bio && (
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wider text-ink-500 font-semibold">Bio</div>
          <p className="mt-1 text-sm text-ink-700 dark:text-ink-200">{user.bio}</p>
        </div>
      )}
    </Modal>
  );
}
