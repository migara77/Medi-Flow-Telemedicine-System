import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Plus, Trash2, AlertCircle, User, Pill, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';

export default function CreatePrescription() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patient_id: state?.patientId || '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await api.get('/doctor/patients');
        setPatients(Array.isArray(data) ? data : []);
      } catch (e) {
        toast.error(getErrorMessage(e, 'Failed to load patients'));
      }
    };
    fetchPatients();
  }, []);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setMed = (i, field, value) =>
    setForm((f) => ({ ...f, medications: f.medications.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)) }));
  const addMed = () => setForm((f) => ({ ...f, medications: [...f.medications, { name: '', dosage: '', frequency: '', duration: '' }] }));
  const removeMed = (i) => setForm((f) => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/prescriptions', form);
      toast.success('Prescription created');
      navigate('/doctor-prescriptions');
    } catch (err) {
      const m = getErrorMessage(err, 'Failed to create prescription');
      setError(m); toast.error(m);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <button onClick={() => navigate(-1)} className="btn-ghost btn-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="brand-logo"><Pill className="w-5 h-5" /></span>
          <div>
            <h1 className="text-2xl font-bold text-ink-900 dark:text-white">New prescription</h1>
            <p className="text-sm text-ink-500">Add medications, dosage and instructions.</p>
          </div>
        </div>

        <form onSubmit={submit} className="card-pad space-y-6">
          {error && (
            <div className="alert-error">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>{error}</div>
            </div>
          )}

          <div>
            <label className="label">Patient</label>
            <div className="input-group">
              <User className="input-icon w-5 h-5" />
              <select className="select input-with-icon" required value={form.patient_id}
                onChange={(e) => setField('patient_id', e.target.value)}>
                <option value="">Choose a patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.email}</option>
                ))}
              </select>
            </div>
            {patients.length === 0 && (
              <p className="mt-2 text-xs text-ink-500">
                You'll see patients here once you've had appointments with them.
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-ink-900 dark:text-white">Medications</h3>
                <p className="text-xs text-ink-500">Add one or more for this prescription.</p>
              </div>
              <button type="button" onClick={addMed} className="btn-secondary btn-sm">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="space-y-3">
              {form.medications.map((med, index) => (
                <motion.div key={index}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-2xl border border-brand-100 dark:border-brand-500/30 bg-brand-50/60 dark:bg-brand-500/5 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-800 dark:text-brand-300">
                      <Pill className="w-4 h-4" /> Medication #{index + 1}
                    </div>
                    {form.medications.length > 1 && (
                      <button type="button" onClick={() => removeMed(index)} className="text-rose-600 text-xs font-semibold inline-flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="label text-xs">Name</label>
                      <input className="input" required placeholder="e.g. Amoxicillin"
                        value={med.name} onChange={(e) => setMed(index, 'name', e.target.value)} />
                    </div>
                    <div>
                      <label className="label text-xs">Dosage</label>
                      <input className="input" required placeholder="500mg"
                        value={med.dosage} onChange={(e) => setMed(index, 'dosage', e.target.value)} />
                    </div>
                    <div>
                      <label className="label text-xs">Frequency</label>
                      <input className="input" placeholder="3x daily"
                        value={med.frequency} onChange={(e) => setMed(index, 'frequency', e.target.value)} />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="label text-xs">Duration</label>
                      <input className="input" required placeholder="7 days"
                        value={med.duration} onChange={(e) => setMed(index, 'duration', e.target.value)} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Instructions</label>
            <textarea rows="3" className="textarea" value={form.instructions}
              onChange={(e) => setField('instructions', e.target.value)}
              placeholder="e.g. Take with food, avoid dairy" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea rows="3" className="textarea" value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="Optional notes for the patient" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-block btn-lg">
            <CheckCircle2 className="w-5 h-5" />
            {loading ? 'Creating…' : 'Create prescription'}
          </button>
        </form>
      </div>
    </div>
  );
}
