// src/features/auth/contexts/AuthContext.js
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, socket } from "@/shared/services/";
import {
  hasPermission,
  normalizePermissions,
  showToast,
} from "@/shared/utils/";
import Load from "@/shared/utils/Load";

export const AuthContext = createContext(null);

const readStoredUser = () => {
  const storedUser = localStorage.getItem("mada_user");
  if (!storedUser) return null;

  try {
    const parsedUser = JSON.parse(storedUser);
    return {
      ...parsedUser,
      permissions: normalizePermissions(parsedUser.permissions),
    };
  } catch {
    localStorage.removeItem("mada_user");
    return null;
  }
};

const persistUser = (userData) => {
  const normalizedUser = {
    ...userData,
    permissions: normalizePermissions(userData?.permissions),
  };

  localStorage.setItem("mada_user", JSON.stringify(normalizedUser));
  return normalizedUser;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedUser = readStoredUser();
        if (!storedUser) {
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get("/auth/me");
        const currentUser = response.data?.data?.user || null;

        if (currentUser) {
          const normalizedUser = persistUser(currentUser);
          setUser(normalizedUser);
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
    const employee = userData?.employee || null;

    if (employee) {
      const normalizedEmployee = {
        ...employee,
        permissions: normalizePermissions(employee.permissions),
      };

      persistUser(normalizedEmployee);
      setUser(normalizedEmployee);
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
      document.cookie =
        "xsrf-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
      localStorage.removeItem("mada_user");
      setUser(null);
      navigate("/login");
    }
  };

  // Connexion Socket.IO : uniquement une fois l'utilisateur authentifié.
  // On rejoint sa room privée ("employee_<id>", voir src/config/socket.js
  // côté serveur) pour recevoir les mises à jour temps réel de son profil.
  useEffect(() => {
    if (!user?.id) {
      if (socket.connected) socket.disconnect();
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    // Le backend pousse le profil complet à jour (ex: permissions modifiées,
    // changement de département/poste) sur ce canal.
    const handleProfileUpdated = (updatedProfile) => {
      const normalizedProfile = {
        ...updatedProfile,
        permissions: normalizePermissions(updatedProfile?.permissions),
      };

      setUser(normalizedProfile);
      localStorage.setItem("mada_user", JSON.stringify(normalizedProfile));
    };

    // Le backend pousse cet événement si le compte est désactivé/supprimé
    // pendant que l'utilisateur est connecté : on le déconnecte immédiatement.
    const handleAccountDisabled = (payload) => {
      showToast.warn(
        payload?.message ||
          "Votre compte a été désactivé par un administrateur.",
      );
      logout();
    };

    socket.on("profile-updated", handleProfileUpdated);
    socket.on("account-disabled", handleAccountDisabled);

    return () => {
      socket.off("profile-updated", handleProfileUpdated);
      socket.off("account-disabled", handleAccountDisabled);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, loading, checkPermission }}
    >
      {loading ? <Load /> : children}
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
