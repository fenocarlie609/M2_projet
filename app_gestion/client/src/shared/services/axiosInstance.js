import axios from "axios";

// URL de base de ton API en développement modulaire
const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// INTERCEPTEUR : Gère les erreurs globales (ex: Session/Cookie expiré)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si le serveur renvoie 401 (Non autorisé / Session expirée)
    if (error.response && error.response.status === 401) {
      // Ne pas rediriger si c'est un appel de login (identifiants incorrects)
      const isLoginRoute =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/me");

      if (!isLoginRoute) {
        // Nettoyage des données de l'interface utilisateur uniquement
        localStorage.removeItem("mada_user");

        // Redirection vers la page de login (session expirée)
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
