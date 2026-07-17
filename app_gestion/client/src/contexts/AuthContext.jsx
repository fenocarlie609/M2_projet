import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // On ne stocke plus le token ici, le navigateur gère le cookie en arrière-plan
  const [user, setUser] = useState(() => {
    const userSaved = localStorage.getItem("mada_user");
    return userSaved ? JSON.parse(userSaved) : null;
  });

  const [loading, setLoading] = useState(true);

  // Synchronisation au démarrage : On vérifie si l'utilisateur est toujours connecté côté serveur
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Optionnel mais recommandé : Fais un appel léger à ton API (ex: /api/me ou /api/validate-session)
        // Le cookie sera envoyé automatiquement par le navigateur.
        // const response = await fetch('/api/me', { credentials: 'include' });
        // if (response.ok) { const data = await response.json(); setUser(data.user); } else { logout(); }
      } catch (error) {
        console.error("Erreur de vérification de session", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Fonction appelée après une connexion réussie
  const login = (userData) => {
    // Le backend a déjà injecté le cookie dans la réponse HTTP (Set-Cookie)
    // On sauvegarde uniquement les infos de profil non sensibles (nom, rôle, port)
    localStorage.setItem("mada_user", JSON.stringify(userData.user));
    setUser(userData.user);
    navigate("/");
  };

  // Fonction pour se déconnecter
  const logout = async () => {
    try {
      // Recommandé : Appeler la route de déconnexion du backend pour qu'il détruise le cookie (Clear-Cookie)
      // await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error("Erreur lors de la suppression du cookie session", err);
    } finally {
      // Nettoyage local obligatoire
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
