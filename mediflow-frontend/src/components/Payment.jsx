import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { CreditCard, CheckCircle2, AlertCircle, Wallet, ShieldCheck, Calendar, Clock, Stethoscope, ArrowLeft } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';

export default function Payment() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({ cardNumber: '', expiryDate: '', cvv: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/appointments/${appointmentId}`);
        setAppointment(data);
      } catch (e) { setError('Failed to load appointment details'); }
    };
    if (appointmentId) load();
  }, [appointmentId]);

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/payments/process', {
        appointment_id: appointmentId,
        amount: appointment?.doctor?.consultation_fee || 100,
        payment_method: paymentMethod,
        card_details: paymentMethod === 'card' ? cardDetails : null,
      });
      toast.success('Payment successful');
      setDone(true);
    } catch (err) {
      const m = getErrorMessage(err, 'Payment failed');
      setError(m); toast.error(m);
    } finally { setLoading(false); }
  };

  if (done) {
    return (
      <div className="page grid place-items-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full p-4">
          <div className="card-pad text-center">
            <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-500/15 grid place-items-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-ink-900 dark:text-white">Payment successful</h2>
            <p className="mt-2 text-ink-500">Your appointment is confirmed.</p>
            <button onClick={() => navigate('/my-appointments')} className="btn-primary btn-block mt-6">
              View my appointments
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const fee = appointment?.doctor?.consultation_fee ?? 100;

  return (
    <div className="page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <button onClick={() => navigate(-1)} className="btn-ghost btn-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="section-title">Complete payment</h1>
        <p className="section-subtitle">Secure your appointment in a single step.</p>

        <div className="mt-6 grid lg:grid-cols-5 gap-6">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <div className="card-pad lg:sticky lg:top-24">
              <h3 className="text-sm uppercase tracking-wider text-ink-500 font-semibold">Order summary</h3>
              {appointment ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Stethoscope className="w-4 h-4 text-brand-700 mt-0.5" />
                    <div>
                      <div className="text-ink-500">Doctor</div>
                      <div className="font-semibold text-ink-900 dark:text-white">{appointment.doctor?.name}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-brand-700 mt-0.5" />
                    <div>
                      <div className="text-ink-500">Date</div>
                      <div className="font-semibold text-ink-900 dark:text-white">{appointment.date}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-brand-700 mt-0.5" />
                    <div>
                      <div className="text-ink-500">Time</div>
                      <div className="font-semibold text-ink-900 dark:text-white">{appointment.time}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink-500">Loading details…</p>
              )}
              <div className="mt-5 pt-5 border-t border-ink-100 dark:border-ink-800 flex items-center justify-between">
                <span className="text-ink-500 text-sm">Total</span>
                <span className="text-2xl font-bold text-ink-900 dark:text-white">${fee}</span>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-ink-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                256-bit encrypted payment
              </div>
            </div>
          </motion.div>

          <form onSubmit={handlePay} className="lg:col-span-3 card-pad space-y-6">
            {error && (
              <div className="alert-error">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" /><div>{error}</div>
              </div>
            )}

            <div>
              <label className="label">Payment method</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ id: 'card', label: 'Card', icon: CreditCard }, { id: 'wallet', label: 'Digital wallet', icon: Wallet }].map((m) => {
                  const Icon = m.icon; const active = paymentMethod === m.id;
                  return (
                    <button type="button" key={m.id} onClick={() => setPaymentMethod(m.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${active ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-500/10 shadow-ring' : 'border-ink-200 dark:border-ink-700 hover:border-brand-300'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`h-9 w-9 rounded-lg grid place-items-center ${active ? 'bg-gradient-to-br from-brand-500 to-accent-600 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-600'}`}><Icon className="w-4 h-4" /></span>
                        <span className="font-semibold text-ink-900 dark:text-white">{m.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {paymentMethod === 'card' && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div>
                  <label className="label">Cardholder name</label>
                  <input type="text" name="name" value={cardDetails.name}
                    onChange={(e) => setCardDetails((c) => ({ ...c, name: e.target.value }))}
                    placeholder="Jane Doe" className="input" />
                </div>
                <div>
                  <label className="label">Card number</label>
                  <div className="input-group">
                    <CreditCard className="input-icon w-5 h-5" />
                    <input type="text" maxLength="19" required placeholder="1234 5678 9012 3456" className="input input-with-icon"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails((c) => ({ ...c, cardNumber: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Expiry</label>
                    <input type="text" required placeholder="MM/YY" className="input"
                      value={cardDetails.expiryDate}
                      onChange={(e) => setCardDetails((c) => ({ ...c, expiryDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">CVV</label>
                    <input type="text" required maxLength="4" placeholder="123" className="input"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails((c) => ({ ...c, cvv: e.target.value }))} />
                  </div>
                </div>
              </motion.div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="alert-info">
                <Wallet className="w-5 h-5 mt-0.5 shrink-0" /><div>You'll be redirected to your wallet provider.</div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary btn-block btn-lg">
              <CreditCard className="w-5 h-5" /> {loading ? 'Processing…' : `Pay $${fee}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
