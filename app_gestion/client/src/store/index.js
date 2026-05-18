import { create } from 'zustand'

/* ─── Auth Store ───────────────────────────────────────────
   État simulé — remplacer par de vrais appels JWT/API
   ────────────────────────────────────────────────────────── */
export const useAuthStore = create((set) => ({
  user: {
    id: 1,
    nom: 'Admin',
    email: 'admin@maritime.mg',
    role: 'admin',   // admin | manager | employe
    avatar: 'AD',
  },
  isAuthenticated: true,

  login:  (user) => set({ user, isAuthenticated: true }),
  logout: ()     => set({ user: null, isAuthenticated: false }),
}))

/* ─── UI Store ─────────────────────────────────────────────
   Préférences interface (sidebar, thème...)
   ────────────────────────────────────────────────────────── */
export const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))
