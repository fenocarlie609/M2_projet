// src/shared/components/layout/RoleGuard.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth"; // Ajuste le nombre de '../' selon ton arborescence exacte[cite: 11]

export const RoleGuard = ({ allowedRoles }) => {
  const { user } = useAuth(); // Récupération de l'utilisateur connecté depuis ton contexte global[cite: 11]

  // 1. Si l'utilisateur n'est pas authentifié, redirection immédiate vers la page de login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si la route impose des rôles spécifiques et que l'utilisateur n'en possède aucun
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirection de sécurité vers le tableau de bord principal
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Tout est en règle : l'Outlet permet le rendu du composant de la route enfant
  return <Outlet />;
};
