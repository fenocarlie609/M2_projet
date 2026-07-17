import axios from "axios";

// URL de base de ton API (Locale ou Cloud Render)
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://nanotech-crm-api.onrender.com/api/v2";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // OBLIGATOIRE POUR LES COOKIES : Autorise l'envoi et la réception automatique
  // des cookies (ex: HttpOnly, Access Token, etc.) lors des requêtes Cross-Origin
  withCredentials: true,
});

// L'intercepteur de requête n'a plus besoin de chercher de token dans le localStorage !
// Le navigateur injecte le cookie tout seul grâce à withCredentials.

// INTERCEPTEUR : Gère les erreurs globales (ex: Session/Cookie expiré)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si le serveur renvoie 401 (Non autorisé / Session expirée)
    if (error.response && error.response.status === 401) {
      // Nettoyage des données de l'interface utilisateur uniquement
      localStorage.removeItem("mada_user");

      // Redirection vers la page de login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
