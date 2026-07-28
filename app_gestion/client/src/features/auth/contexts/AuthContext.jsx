// src/features/auth/contexts/AuthContext.js
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "@/shared/services/";
import { hasPermission } from "@/shared/utils/";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const userSaved = localStorage.getItem("mada_user");
    return userSaved ? JSON.parse(userSaved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Synchronisation au démarrage : vérifie la session côté serveur
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userSaved = localStorage.getItem("mada_user");
        if (!userSaved) {
          setLoading(false);
          return; // Pas d'utilisateur sauvegardé, pas besoin d'appeler /auth/me
        }

        const response = await axiosInstance.get("/auth/me");

        // Récupère le profil frais nettoyé par le backend
        const currentUser = response.data?.data?.user || null;

        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem("mada_user", JSON.stringify(currentUser));
        } else {
          localStorage.removeItem("mada_user");
          setUser(null);
        }
      } catch (error) {
        localStorage.removeItem("mada_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const checkPermission = useCallback(
    (module, action) => {
      return hasPermission(user, { module, action });
    },
    [user],
  );

  // Fonction appelée après une connexion réussie
  const login = (userData) => {
    // Le payload reçu ici est déjà { employee }, pas
    // { status, token, data: { employee } } — l'extraction a déjà été faite
    // en amont, dans login.service.js / LoginPage.jsx.
    const employee = userData?.employee || null;

    if (employee) {
      // Alignement de la structure des permissions du login sur celle de /auth/me
      if (employee.permissions && Array.isArray(employee.permissions)) {
        employee.permissions = employee.permissions.map(
          ({ module, action }) => ({
            module,
            action,
          }),
        );
      }

      localStorage.setItem("mada_user", JSON.stringify(employee));
      setUser(employee);
      navigate("/dashboard");
    }
  };

  // Fonction pour se déconnecter
  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      // Échec silencieux : la révocation du cookie serveur a peut-être échoué,
      // mais on nettoie quand même la session côté client.
    } finally {
      localStorage.removeItem("mada_user");
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, loading, checkPermission }}
    >
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
