import { create } from 'zustand';

const initial = (() => {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch { return 'light'; }
})();

const apply = (t) => {
  if (t === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
};

apply(initial);

export const useTheme = create((set, get) => ({
  theme: initial,
  setTheme: (t) => {
    apply(t); try { localStorage.setItem('theme', t); } catch {}
    set({ theme: t });
  },
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    apply(next); try { localStorage.setItem('theme', next); } catch {}
    set({ theme: next });
  },
}));
