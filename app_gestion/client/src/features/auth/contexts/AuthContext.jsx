// src/features/auth/contexts/AuthContext.js
import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/shared/services/axiosInstance";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Initialisation du state avec l'utilisateur du localStorage
  const [user, setUser] = useState(() => {
    const userSaved = localStorage.getItem("mada_user");
    console.log(
      "🔍 [AuthInit] Lecture initiale du localStorage 'mada_user' :",
      userSaved ? JSON.parse(userSaved) : null,
    );
    return userSaved ? JSON.parse(userSaved) : null;
  });

  const [loading, setLoading] = useState(true);

  // Synchronisation au démarrage : vérifie la session côté serveur[cite: 12]
  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log("🔄 [AuthCheck] Démarrage de la vérification de session...");
      try {
        const userSaved = localStorage.getItem("mada_user");
        if (!userSaved) {
          console.log(
            "🛑 [AuthCheck] Aucun utilisateur dans le localStorage. Annulation de l'appel /auth/me.",
          );
          setLoading(false);
          return; // Pas d'utilisateur sauvegardé, pas besoin d'appeler /auth/me[cite: 12]
        }

        console.log("📡 [AuthCheck] Envoi de la requête GET vers /auth/me...");
        const response = await axiosInstance.get("/auth/me");
        console.log(
          "📥 [AuthCheck] Réponse brute reçue de /auth/me :",
          response.data,
        );

        // Récupère le profil frais nettoyé par le backend[cite: 12]
        const currentUser = response.data?.data?.user || null;
        console.log(
          "👤 [AuthCheck] Utilisateur extrait de la réponse :",
          currentUser,
        );

        if (currentUser) {
          console.log(
            "✅ [AuthCheck] Session valide. Mise à jour du state et du localStorage.",
          );
          setUser(currentUser);
          localStorage.setItem("mada_user", JSON.stringify(currentUser));
        } else {
          console.log(
            "⚠️ [AuthCheck] Réponse vide ou invalide. Nettoyage du localStorage.",
          );
          localStorage.removeItem("mada_user");
          setUser(null);
        }
      } catch (error) {
        console.error(
          "❌ [AuthCheck] Erreur lors de la vérification d'authentification :",
          error.message,
        );
        localStorage.removeItem("mada_user");
        setUser(null);
      } finally {
        console.log("🏁 [AuthCheck] Fin de la procédure (loading = false).");
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Fonction appelée après une connexion réussie[cite: 12]
  const login = (userData) => {
    console.log(
      "🔑 [AuthLogin] Données brutes passées à la fonction login() :",
      userData,
    );

    // CORRECTION : Extraction directe de l'employé depuis userData
    const employee = userData?.employee || null;
    console.log("👤 [AuthLogin] Employé extrait du payload :", employee);

    if (employee) {
      // Alignement de la structure des permissions du login sur celle de /auth/me
      if (employee.permissions && Array.isArray(employee.permissions)) {
        console.log(
          "🛠️ [AuthLogin] Format de permissions brut détecté. Nettoyage en cours...",
        );
        employee.permissions = employee.permissions.map(
          ({ module, action }) => ({
            module,
            action,
          }),
        );
        console.log(
          "✨ [AuthLogin] Permissions après nettoyage :",
          employee.permissions,
        );
      }

      console.log(
        "💾 [AuthLogin] Sauvegarde dans le localStorage et hydratation du state.",
      );
      localStorage.setItem("mada_user", JSON.stringify(employee));
      setUser(employee);

      console.log("🚀 [AuthLogin] Redirection vers /dashboard");
      navigate("/dashboard");
    } else {
      console.error(
        "❌ [AuthLogin] Impossible de se connecter : l'objet employee est introuvable.",
      );
    }
  };

  // Fonction pour se déconnecter[cite: 12]
  const logout = async () => {
    console.log("🚪 [AuthLogout] Initialisation de la déconnexion...");
    try {
      console.log(
        "📡 [AuthLogout] Envoi de la requête POST vers /auth/logout...",
      );
      await axiosInstance.post("/auth/logout");
      console.log(
        "✅ [AuthLogout] Cookie de session révoqué avec succès côté serveur.",
      );
    } catch (err) {
      console.error(
        "❌ [AuthLogout] Erreur lors de la suppression du cookie session au serveur :",
        err.message,
      );
    } finally {
      console.log(
        "🧹 [AuthLogout] Nettoyage local : suppression de 'mada_user' et redirection vers /login.",
      );
      localStorage.removeItem("mada_user");
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider",
    );
  }
  return context;
};

export default AuthProvider;
