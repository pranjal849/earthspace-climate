import { create } from 'zustand'

export const useAlertStore = create((set, get) => ({
  realtimeAlerts: [],
  unreadCount: 0,
  soundEnabled: false,

  addAlert: (alert) => set((state) => ({
    realtimeAlerts: [alert, ...state.realtimeAlerts].slice(0, 50),
    unreadCount: state.unreadCount + 1,
  })),

  clearAlerts: () => set({ realtimeAlerts: [], unreadCount: 0 }),

  markRead: () => set({ unreadCount: 0 }),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}))
