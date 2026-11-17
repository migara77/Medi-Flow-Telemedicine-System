import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ArrowLeft, AlertCircle, Calendar, Clock, Stethoscope, Briefcase, CheckCircle2 } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';

const initials = (name = '?') =>
  name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/doctors/${doctorId}`);
        setDoctor(data);
      } catch (e) {
        setError('Failed to load doctor details');
      }
    };
    if (doctorId) load();
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId || !selectedDate) { setSlots([]); return; }
    const loadSlots = async () => {
      setSlotsLoading(true);
      try {
        const { data } = await api.get(`/doctors/${doctorId}/slots`, { params: { date: selectedDate } });
        setSlots(data.slots || []);
        setSelectedTime('');
      } catch (e) { setSlots([]); }
      finally { setSlotsLoading(false); }
    };
    loadSlots();
  }, [doctorId, selectedDate]);

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedTime) { setError('Please pick a time slot.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/appointments', {
        doctor_id: doctorId,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        reason,
      });
      toast.success('Appointment booked');
      navigate(`/payment/${data.id}`, { state: { appointmentId: data.id } });
    } catch (err) {
      const m = getErrorMessage(err, 'Failed to book appointment');
      setError(m); toast.error(m);
    } finally { setLoading(false); }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <button onClick={() => navigate('/doctors')} className="btn-ghost btn-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to doctors
        </button>

        {doctor && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card-pad mb-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 text-white grid place-items-center text-lg font-bold shadow-glow">
                {initials(doctor.name)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink-900 dark:text-white">{doctor.name}</h2>
                <p className="text-sm text-brand-700 dark:text-brand-300 font-medium flex items-center gap-1.5 mt-0.5">
                  <Stethoscope className="w-4 h-4" /> {doctor.specialization || 'General'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="badge-muted"><Briefcase className="w-3.5 h-3.5" /> {doctor.experience_years ?? 0} yrs exp</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={submit} className="card-pad space-y-6">
          <div>
            <h3 className="text-lg font-bold text-ink-900 dark:text-white">Book your appointment</h3>
            <p className="text-sm text-ink-500 mt-1">Pick a date and an available slot.</p>
          </div>

          {error && (
            <div className="alert-error">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>{error}</div>
            </div>
          )}

          <div>
            <label className="label">Preferred date</label>
            <div className="input-group">
              <Calendar className="input-icon w-5 h-5" />
              <input type="date" min={today} value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)} required className="input input-with-icon" />
            </div>
          </div>

          {selectedDate && (
            <div>
              <label className="label">Available time slots</label>
              {slotsLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 rounded-lg shimmer" />)}
                </div>
              ) : slots.length === 0 ? (
                <div className="alert-warning">
                  <Clock className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>The doctor isn't available on this date. Please pick another day.</div>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <AnimatePresence>
                    {slots.map((s) => (
                      <motion.button key={s} type="button"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setSelectedTime(s)}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold border transition ${
                          selectedTime === s
                            ? 'bg-gradient-to-r from-brand-500 to-accent-600 text-white border-transparent shadow-glow'
                            : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-200 hover:border-brand-400'
                        }`}>
                        {s}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="label">Reason for visit</label>
            <textarea rows="4" value={reason} onChange={(e) => setReason(e.target.value)} required
              placeholder="Briefly describe your symptoms or concerns…" className="textarea" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-block btn-lg">
            <CheckCircle2 className="w-5 h-5" /> {loading ? 'Booking…' : 'Continue to payment'}
          </button>
        </form>
      </div>
    </div>
  );
}
