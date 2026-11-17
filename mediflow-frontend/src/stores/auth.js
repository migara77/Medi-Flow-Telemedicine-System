import { create } from 'zustand';
import { api } from '../lib/api';

const loadUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
};

export const useAuth = create((set) => ({
  user: loadUser(),
  setUser: (u) => {
    if (u) localStorage.setItem('user', JSON.stringify(u));
    else localStorage.removeItem('user');
    set({ user: u });
  },
  logout: async () => {
    try { await api.post('/logout'); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null });
  },
  refresh: async () => {
    try {
      const { data } = await api.get('/profile');
      localStorage.setItem('user', JSON.stringify(data));
      set({ user: data });
      return data;
    } catch { return null; }
  },
}));
