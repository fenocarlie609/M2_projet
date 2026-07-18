import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../shared/services/axiosInstance";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // On ne stocke plus le token ici, le navigateur gère le cookie en arrière-plan
  const [user, setUser] = useState(() => {
    const userSaved = localStorage.getItem("mada_user");
    return userSaved ? JSON.parse(userSaved) : null;
  });

  const [loading, setLoading] = useState(true);

  // Synchronisation au démarrage : vérifie la session côté serveur.
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Vérifier d'abord le localStorage pour éviter les appels inutiles
        const userSaved = localStorage.getItem("mada_user");
        if (!userSaved) {
          setLoading(false);
          return; // Pas d'utilisateur sauvegardé, pas besoin d'appeler /auth/me
        }

        console.log("Checking auth status... /auth/me is being called");
        const response = await axiosInstance.get("/auth/me");

        console.log("Auth status response:", response.data?.data?.user); // Debug: Log the response data
        const currentUser = response.data?.data?.user || null;

        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem("mada_user", JSON.stringify(currentUser));
        } else {
          localStorage.removeItem("mada_user");
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error.message);
        localStorage.removeItem("mada_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Fonction appelée après une connexion réussie
  const login = (userData) => {
    localStorage.setItem("mada_user", JSON.stringify(userData.user));
    setUser(userData.user);
    navigate("/");
  };

  // Fonction pour se déconnecter
  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      console.error("Erreur lors de la suppression du cookie session", err);
    } finally {
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
