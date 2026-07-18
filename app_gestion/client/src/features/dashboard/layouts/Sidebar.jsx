import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../features/auth/contexts/AuthContext";
import { sidebarRoutes } from "../../../core/routes/routeConfig";
import { FiX, FiAnchor } from "react-icons/fi";

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  const menuItems = sidebarRoutes
    .filter((route) => !route.roles || route.roles.includes(user?.role))
    .map((route) => ({
      ...route,
      active: pathname === route.path,
    }));

  const sections = menuItems.reduce((acc, route) => {
    const section = route.section || "Menu";
    if (!acc[section]) acc[section] = [];
    acc[section].push(route);
    return acc;
  }, {});

  return (
    <>
      {/* Overlay Mobile : Assombrit l'arrière-plan quand la barre est ouverte sur petit écran */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Conteneur principal de la Sidebar */}
      <aside
        className={`
        fixed top-0 bottom-0 left-0 z-50 flex flex-col 
        w-64 bg-navy-sider border-r border-navy-trigger
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0
      `}
      >
        {/* Header de la Sidebar (Logo / Identité nationale) */}
        <div className="h-20 flex items-center justify-between px-6 bg-navy-trigger/50 border-b border-navy-sub">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
              <FiAnchor className="text-lg" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm tracking-wider leading-none">
                MADA MARITIME
              </span>
              <span className="text-[10px] text-slate-400 mt-1 font-medium tracking-widest">
                PORTAIL NATIONAL
              </span>
            </div>
          </div>

          {/* Bouton de fermeture visible uniquement sur Mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white lg:hidden p-1 rounded-md hover:bg-navy-trigger transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Liens de Navigation */}
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

        {/* Footer de la Sidebar (Profil Utilisateur connecté) */}
        <div className="p-4 border-t border-navy-sub bg-navy-sub/40">
          <div className="flex items-center gap-3 p-1.5 rounded-xl bg-navy-trigger/30">
            <div className="w-9 h-9 rounded-lg bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-sm border border-brand-primary/30">
              TM
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                Port de Toamasina
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                Opérateur Principal
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
