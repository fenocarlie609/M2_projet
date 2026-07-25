// src/shared/components/ui/Tabs.jsx
import React from "react";

/**
 * Tabs générique et réutilisable pour basculer entre plusieurs vues sur une
 * même page (ex: Comptes / Permissions, Actifs / Archivés, etc.).
 *
 * tabs: [{ id: "accounts", label: "Comptes" }, { id: "permissions", label: "Permissions" }]
 */
export const Tabs = ({ tabs = [], activeTab, onChange, className = "" }) => {
  return (
    <div
      className={`flex items-center gap-2 border-b border-slate-200 ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
              isActive
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
