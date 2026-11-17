import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, LayoutDashboard } from 'lucide-react';

export default function BookAppointmentComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const appointmentId = location.state?.appointmentId;
  return (
    <div className="page grid place-items-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full p-4">
        <div className="card-pad text-center">
          <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-500/15 grid place-items-center mx-auto mb-4 animate-pulse-soft">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-ink-900 dark:text-white">Appointment booked!</h2>
          <p className="mt-2 text-ink-500">Your appointment has been scheduled successfully.</p>
          {appointmentId && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-50 dark:bg-ink-800 text-ink-700 dark:text-ink-200 text-xs font-medium">
              Reference: <span className="font-mono">#{appointmentId}</span>
            </div>
          )}
          <div className="mt-6 space-y-3">
            <button onClick={() => navigate('/my-appointments')} className="btn-primary btn-block">
              <Calendar className="w-4 h-4" /> View my appointments
            </button>
            <button onClick={() => navigate('/patient-dashboard')} className="btn-secondary btn-block">
              <LayoutDashboard className="w-4 h-4" /> Back to dashboard
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
