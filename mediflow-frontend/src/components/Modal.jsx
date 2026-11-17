import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className={`modal ${maxWidth}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div className="sticky top-0 z-10 bg-white dark:bg-ink-900 border-b border-ink-100 dark:border-ink-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-900 dark:text-white">{title}</h2>
              <button onClick={onClose} className="text-ink-400 hover:text-ink-900 dark:hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5">{children}</div>
            {footer && (
              <div className="sticky bottom-0 bg-white dark:bg-ink-900 border-t border-ink-100 dark:border-ink-800 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
