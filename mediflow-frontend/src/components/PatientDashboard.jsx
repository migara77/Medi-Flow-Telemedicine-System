import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, FileText, Calendar, ArrowRight, Stethoscope, Sparkles, FolderOpen, UserCog } from 'lucide-react';
import { useAuth } from '../stores/auth';

const menu = [
  { icon: Search, title: 'Find Doctors', description: 'Browse verified specialists and book a slot in minutes.', cta: 'Browse doctors', path: '/doctors', gradient: 'from-brand-500 to-accent-600' },
  { icon: Calendar, title: 'My Appointments', description: 'View upcoming visits, reschedule or cancel.', cta: 'View appointments', path: '/my-appointments', gradient: 'from-emerald-500 to-brand-600' },
  { icon: FileText, title: 'My Prescriptions', description: 'Access and download your prescription history.', cta: 'View prescriptions', path: '/my-prescriptions', gradient: 'from-accent-500 to-fuchsia-500' },
  { icon: FolderOpen, title: 'Medical Records', description: 'Upload and manage scans, reports, and documents.', cta: 'Open records', path: '/medical-records', gradient: 'from-amber-500 to-rose-500' },
  { icon: UserCog, title: 'My Profile', description: 'Update your contact details, password and bio.', cta: 'Edit profile', path: '/profile', gradient: 'from-sky-500 to-indigo-500' },
];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const me = useAuth((s) => s.user);

  return (
    <div className="page">
      <div className="page-container py-10 animate-fade-in">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700 text-white p-8 sm:p-12 shadow-glow">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-accent-400/30 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Patient portal
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              Welcome back, {me?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="mt-2 max-w-xl text-white/80">
              Manage your appointments, prescriptions and healthcare journey — all in one beautifully simple place.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => navigate('/doctors')} className="btn bg-white text-brand-700 hover:bg-brand-50">
                <Search className="w-4 h-4" /> Find a doctor
              </button>
              <button onClick={() => navigate('/my-appointments')} className="btn bg-white/10 text-white hover:bg-white/20 backdrop-blur">
                <Calendar className="w-4 h-4" /> View appointments
              </button>
            </div>
          </div>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menu.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button key={i} onClick={() => navigate(item.path)}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="card card-hover p-6 text-left group"
              >
                <div className={`stat-icon ${item.gradient} mb-5`}><Icon className="w-6 h-6" /></div>
                <h3 className="text-lg font-bold text-ink-900 dark:text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-ink-500">{item.description}</p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                  {item.cta} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-10 card p-6 flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-brand-100 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 grid place-items-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-ink-900 dark:text-white">Tip</p>
            <p className="text-sm text-ink-600 dark:text-ink-300">
              You can filter doctors by specialization. Bookings include the reason notes so the doctor can prepare in advance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
