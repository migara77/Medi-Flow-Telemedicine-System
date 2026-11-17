import { create } from 'zustand';
import { api } from '../lib/api';

export const useNotifications = create((set, get) => ({
  items: [],
  unread: 0,
  loading: false,
  fetch: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/notifications');
      set({ items: data.items || [], unread: data.unread || 0, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  markRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      const items = get().items.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      set({ items, unread: Math.max(0, get().unread - 1) });
    } catch {}
  },
  markAllRead: async () => {
    try {
      await api.put('/notifications/read-all');
      const items = get().items.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }));
      set({ items, unread: 0 });
    } catch {}
  },
}));
