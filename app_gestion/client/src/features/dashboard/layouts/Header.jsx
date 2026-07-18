import React from "react";
import { FiMenu, FiBell, FiGlobe, FiSearch } from "react-icons/fi";

export const Header = ({ onMenuToggle }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200/60 flex items-center justify-between px-4 md:px-6 lg:px-8 sticky top-0 z-30">
      {/* Partie Gauche : Bouton Menu (Mobile) & Recherche (Desktop) */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 lg:hidden rounded-lg hover:bg-slate-100 transition-colors"
        >
          <FiMenu size={20} />
        </button>

        {/* Barre de recherche premium */}
        <div className="relative w-full hidden sm:block">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Rechercher un navire, un cargo, un billet..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Partie Droite : Statut Réseau & Notifications */}
      <div className="flex items-center gap-4">
        {/* Indicateur Madagascar Coast Guard Hub (Visuel uniquement sur tablette/desktop) */}
        <div className="hidden md:flex items-center gap-2 text-[11px] font-semibold text-slate-500 tracking-wider bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
          <FiGlobe className="text-brand-primary animate-pulse text-sm" />
          <span>Liaison APMF: En Ligne</span>
        </div>

        {/* Séparateur */}
        <div className="hidden md:block h-5 w-px bg-slate-200" />

        {/* Cloche de Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-50 transition-colors">
          <FiBell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        </button>

        {/* Badge d'identification HQ */}
        <span className="text-[10px] font-bold text-brand-primary tracking-widest bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md">
          MADA-HQ
        </span>
      </div>
    </header>
  );
};
