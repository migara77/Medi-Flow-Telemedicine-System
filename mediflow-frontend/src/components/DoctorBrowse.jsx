import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';

export default function DoctorBrowse() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate('/doctors', { replace: true }), 600);
    return () => clearTimeout(t);
  }, [navigate]);
  return (
    <div className="page grid place-items-center">
      <div className="card-pad text-center max-w-sm animate-fade-in">
        <div className="brand-logo mx-auto mb-4 animate-pulse-soft"><Stethoscope className="w-5 h-5" /></div>
        <p className="font-semibold text-ink-900 dark:text-white">Loading doctors…</p>
        <button onClick={() => navigate('/doctors')} className="btn-primary mt-4">Go to doctors</button>
      </div>
    </div>
  );
}
