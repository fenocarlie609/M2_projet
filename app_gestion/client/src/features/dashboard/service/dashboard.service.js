// src/features/dashboard/service/dashboard.service.js
import { api } from "@/shared/services";

export const dashboardService = {
  // Le serveur ne renvoie que les blocs autorises pour l'utilisateur
  // connecte : le client n'a donc rien a filtrer.
  getSummary: () => api.get("/dashboard/summary"),
};
