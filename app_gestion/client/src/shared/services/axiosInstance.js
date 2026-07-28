import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// INTERCEPTEUR : Gère les erreurs globales sans éjection sauvage
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si le serveur renvoie 401 (Non autorisé / Session expirée)
    if (error.response && error.response.status === 401) {
      const isLoginRoute =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/me");

      if (!isLoginRoute) {
        console.warn("⚠️ Requête 401 détectée sur :", error.config.url);

        // OPTIONNEL : Désactivé temporairement pour éviter les déconnexions en dév
        // localStorage.removeItem("mada_user");
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
