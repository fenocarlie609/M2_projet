// src/core/routes/RoleGuard.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { hasPermission } from "@/shared/utils/permissions";

export const RoleGuard = ({ requiredPermission }) => {
  const { user, loading } = useAuth(); // Récupère le statut et l'utilisateur[cite: 11, 12]

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-navy-sider text-white">
        Chargement des autorisations...
      </div>
    );
  }

  // Redirection vers le login si non authentifié[cite: 12]
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔥 Vérification de la permission avec notre helper centralisé
  const isAuthorized = hasPermission(user, requiredPermission);

  // Si l'utilisateur n'a pas les droits, redirection ou affichage d'une page 403
  if (!isAuthorized) {
    return <Navigate to="/dashboard" replace />;
    // Tu peux aussi le rediriger vers une page "/403" dédiée si tu en as une
  }

  return <Outlet />;
};
