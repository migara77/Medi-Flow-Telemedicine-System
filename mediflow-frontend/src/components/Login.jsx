import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Mail, Lock, Eye, EyeOff, Stethoscope, AlertCircle, ShieldCheck, Calendar, FileText } from 'lucide-react';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from '../stores/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuth((s) => s.setUser);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/login', { email, password });
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name?.split(' ')[0] || ''}`);
      const role = data.user.role;
      if (role === 'patient') navigate('/patient-dashboard');
      else if (role === 'doctor') navigate('/doctor-dashboard');
      else if (role === 'admin') navigate('/admin-dashboard');
      else navigate('/');
    } catch (err) {
      const m = getErrorMessage(err, 'Login failed. Check your credentials.');
      setError(m); toast.error(m);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink-50 dark:bg-ink-950">
      <div className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-[28rem] h-[28rem] rounded-full bg-accent-400/30 blur-3xl" />

        <div className="relative brand-mark text-white">
          <span className="brand-logo bg-white/15 backdrop-blur shadow-none"><Stethoscope className="w-5 h-5" /></span>
          <span className="text-xl">MediFlow</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight mb-4">Healthcare, beautifully simplified.</h2>
          <p className="text-white/80 text-lg mb-8">
            Book trusted doctors, manage appointments, and access prescriptions — all in one place.
          </p>
          <ul className="space-y-3 text-white/90">
            <li className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-brand-200" /> Verified specialists</li>
            <li className="flex items-center gap-3"><Calendar className="w-5 h-5 text-brand-200" /> Instant appointment booking</li>
            <li className="flex items-center gap-3"><FileText className="w-5 h-5 text-brand-200" /> Digital prescriptions</li>
          </ul>
        </motion.div>

        <div className="relative text-xs text-white/60">© {new Date().getFullYear()} MediFlow Health</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md">
          <div className="lg:hidden brand-mark mb-8 text-ink-900 dark:text-white">
            <span className="brand-logo"><Stethoscope className="w-5 h-5" /></span>
            <span className="text-xl">MediFlow</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 dark:text-white">Welcome back</h1>
          <p className="mt-2 text-ink-500">Sign in to continue to your dashboard.</p>

          {error && (
            <div className="alert-error mt-6">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" /><div>{error}</div>
            </div>
          )}

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="input-group">
                <Mail className="input-icon w-5 h-5" />
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className="input input-with-icon" />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="input-group">
                <Lock className="input-icon w-5 h-5" />
                <input id="password" type={showPwd ? 'text' : 'password'} required value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="input input-with-icon pr-12" />
                <button type="button" onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 p-1">
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary btn-block btn-lg">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-ink-500">
            New to MediFlow?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">Create an account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
