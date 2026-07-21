// src/shared/components/ui/PageHeader.jsx
import React from "react";

export const PageHeader = ({ title, subtitle, children }) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs font-medium text-slate-500 mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Zone optionnelle pour insérer des boutons (Ajouter, Exporter, etc.) */}
      {children && (
        <div className="flex items-center gap-3 shrink-0">{children}</div>
      )}
    </div>
  );
};
