// src/shared/components/ui/StatsCard.jsx
import React from "react";

export const StatsCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = "default", // default | brand
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-premium flex items-center justify-between">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <h4 className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </h4>
        {subtext && (
          <p className="text-xs text-slate-500 font-medium">{subtext}</p>
        )}
      </div>

      {Icon && (
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
            variant === "brand"
              ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
              : "bg-slate-50 text-slate-500 border-slate-200"
          }`}
        >
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};
