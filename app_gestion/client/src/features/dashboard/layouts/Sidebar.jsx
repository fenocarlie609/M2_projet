// src/shared/components/layout/Sidebar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/";
import { sidebarRoutes } from "@/core/routes/routeConfig";
// 1. Ajout de FiLogOut
import { FiX, FiAnchor, FiLogOut } from "react-icons/fi";
import { hasPermission } from "@/shared/utils/";

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // 2. Récupération de la fonction de déconnexion
  const { user, logout } = useAuth();

  // Filtrage des routes via la fonction centralisée hasPermission
  const menuItems = sidebarRoutes
    .filter((route) => hasPermission(user, route.requiredPermission))
    .map((route) => ({
      ...route,
      active: pathname === route.path,
    }));

  // Groupement des routes autorisées par section
  const sections = menuItems.reduce((acc, route) => {
    const section = route.section || "Menu";
    if (!acc[section]) acc[section] = [];
    acc[section].push(route);
    return acc;
  }, {});

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    try {
      await logout(); // Exécute la fonction de ton contexte
      // Redirection optionnelle si ton contexte ne s'en charge pas déjà :
      // navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Conteneur de la Sidebar */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 flex flex-col 
          w-64 bg-navy-sider border-r border-navy-trigger
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0
        `}
      >
        {/* Header de la Sidebar */}
        <div className="h-20 flex items-center justify-between px-6 bg-navy-trigger/50 border-b border-navy-sub">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
              <FiAnchor className="text-lg" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm tracking-wider leading-none">
                LCT PREMIUM
              </span>
              <span className="text-[10px] text-slate-400 mt-1 font-medium tracking-widest">
                LOGISTIQUE & FRET
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white lg:hidden p-1 rounded-md hover:bg-navy-trigger transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Liens de Navigation filtrés */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {Object.entries(sections).map(([sectionTitle, items]) => (
            <div key={sectionTitle} className="mb-6">
              <p className="px-3 mb-3 text-[11px] uppercase tracking-[0.22em] text-slate-500 font-semibold">
                {sectionTitle}
              </p>
              <div className="space-y-1.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => {
                        navigate(item.path);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                        ${
                          item.active
                            ? "bg-brand-primary text-white shadow-md shadow-emerald-950/30"
                            : "text-slate-300 hover:bg-navy-trigger hover:text-white"
                        }
                      `}
                    >
                      <Icon
                        className={`text-lg ${item.active ? "text-white" : "text-slate-400"}`}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* 3. Footer de la Sidebar dynamique MODIFIÉ */}
        <div className="p-4 border-t border-navy-sub bg-navy-sub/40">
          <div className="flex items-center gap-3 p-1.5 rounded-xl bg-navy-trigger/30">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-sm border border-brand-primary/30">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : "ME"}
            </div>

            {/* Ajout de flex-1 pour pousser le bouton à droite */}
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || "Utilisateur"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.position?.label || "Employé Connecté"}
              </p>
            </div>

            {/* Nouveau bouton de déconnexion */}
            <button
              onClick={handleLogout}
              title="Se déconnecter"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
