// src/shared/components/ui/StatsCard.jsx
import React from "react";

export const StatsCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = "default",
}) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/60 shadow-premium flex items-center justify-between gap-4 w-full">
      <div className="space-y-1 sm:space-y-2 min-w-0">
        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
          {title}
        </p>
        <h4 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
          {value}
        </h4>
        {subtext && (
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
            {subtext}
          </p>
        )}
      </div>

      {Icon && (
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border shrink-0 ${
            variant === "brand"
              ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
              : "bg-slate-50 text-slate-500 border-slate-200"
          }`}
        >
          <Icon className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
        </div>
      )}
    </div>
  );
};
