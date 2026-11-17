import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useNotifications } from '../stores/notifications';
import usePolling from '../hooks/usePolling';

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
};

export default function NotificationBell() {
  const { items, unread, fetch: fetchN, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { fetchN(); }, [fetchN]);
  usePolling(fetchN, 10000);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)}
        className="relative h-9 w-9 rounded-full bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-ink-800/80 grid place-items-center transition">
        <Bell className="w-4.5 h-4.5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold grid place-items-center animate-pulse-soft">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-800">
              <div className="font-semibold text-ink-900 dark:text-white">Notifications</div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs font-medium text-brand-700 hover:text-brand-800 inline-flex items-center gap-1">
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-ink-400 hover:text-ink-900 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {items.length === 0 ? (
                <div className="p-8 text-center text-sm text-ink-500">
                  You're all caught up 🎉
                </div>
              ) : (
                items.map((n) => (
                  <div key={n.id}
                    className={`px-4 py-3 border-b border-ink-100 dark:border-ink-800 flex items-start gap-3 cursor-pointer transition ${n.read_at ? '' : 'bg-brand-50/40 dark:bg-brand-500/5'}`}
                    onClick={() => !n.read_at && markRead(n.id)}
                  >
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-600 text-white grid place-items-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-ink-900 dark:text-white">{n.title}</div>
                      {n.body && <div className="text-xs text-ink-600 dark:text-ink-300 mt-0.5 line-clamp-2">{n.body}</div>}
                      <div className="text-[11px] text-ink-400 mt-1">{formatTime(n.created_at)}</div>
                    </div>
                    {!n.read_at && (
                      <button onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                        className="text-brand-600 hover:text-brand-800 p-1" title="Mark read">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
