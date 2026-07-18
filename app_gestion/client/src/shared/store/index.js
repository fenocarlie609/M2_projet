import { create } from "zustand";

/* ─── Auth Store ───────────────────────────────────────────
  Stockage global de l'état d'authentification avec Zustand
*/
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
