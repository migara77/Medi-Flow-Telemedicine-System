import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  LogOut, Stethoscope, Calendar, FileText, Search, LayoutDashboard, Pill, Users,
  FolderOpen, UserCog, BarChart3, CalendarDays, Sun, Moon, Menu, X,
} from 'lucide-react';
import { useAuth } from '../stores/auth';
import { useTheme } from '../stores/theme';
import NotificationBell from './NotificationBell';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') return null;
  if (!user) return null;

  const linksByRole = {
    patient: [
      { to: '/patient-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/doctors', label: 'Find Doctors', icon: Search },
      { to: '/my-appointments', label: 'Appointments', icon: Calendar },
      { to: '/my-prescriptions', label: 'Prescriptions', icon: FileText },
      { to: '/medical-records', label: 'Records', icon: FolderOpen },
      { to: '/profile', label: 'Profile', icon: UserCog },
    ],
    doctor: [
      { to: '/doctor-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/doctor-availability', label: 'Hours', icon: CalendarDays },
      { to: '/doctor-prescriptions', label: 'Prescriptions', icon: Pill },
      { to: '/create-prescription', label: 'New Rx', icon: FileText },
      { to: '/profile', label: 'Profile', icon: UserCog },
    ],
    admin: [
      { to: '/admin-dashboard', label: 'Users', icon: Users },
      { to: '/admin-analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/profile', label: 'Profile', icon: UserCog },
    ],
  };

  const links = linksByRole[user.role] || [];
  const initials = (user.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const handleLogout = async () => {
    await logout();
    toast.info('Signed out');
    navigate('/login');
  };

  const homePath = `/${user.role}-dashboard`;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 bg-white/80 dark:bg-ink-900/80 backdrop-blur-md border-b border-ink-100 dark:border-ink-800"
    >
      <div className="page-container flex items-center h-16 gap-4">
        <Link to={homePath} className="brand-mark text-ink-900 dark:text-white shrink-0">
          <span className="brand-logo"><Stethoscope className="w-5 h-5" /></span>
          <span className="text-lg tracking-tight">
            Medi<span className="text-brand-600 dark:text-brand-400">Flow</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                    : 'text-ink-600 dark:text-ink-300 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-brand-50/60 dark:hover:bg-ink-800'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={toggle} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="h-9 w-9 rounded-full bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-ink-800/80 grid place-items-center transition">
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun className="w-4 h-4" />
                </motion.span>
              ) : (
                <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <NotificationBell />

          <div className="hidden sm:flex items-center gap-3 ml-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-accent-600 text-white grid place-items-center text-sm font-semibold shadow-glow">
              {initials}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-ink-900 dark:text-white">{user.name}</div>
              <div className="text-xs text-ink-500 dark:text-ink-400 capitalize">{user.role}</div>
            </div>
          </div>

          <button onClick={handleLogout} className="btn-secondary btn-sm hidden sm:inline-flex">
            <LogOut className="w-4 h-4" /><span>Logout</span>
          </button>

          <button onClick={() => setOpen((o) => !o)} className="lg:hidden h-9 w-9 rounded-full bg-ink-100 dark:bg-ink-800 grid place-items-center">
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-ink-100 dark:border-ink-800"
          >
            <div className="page-container py-3 space-y-1">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                        : 'text-ink-700 dark:text-ink-200 hover:bg-brand-50 dark:hover:bg-ink-800'
                    }`
                  }>
                  <Icon className="w-4 h-4" /> {label}
                </NavLink>
              ))}
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 w-full">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
