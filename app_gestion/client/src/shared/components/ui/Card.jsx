// src/shared/components/ui/Card.jsx
import React from "react";

export const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white border border-slate-200/60 rounded-2xl shadow-premium overflow-hidden w-full ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, className = "" }) => (
  <div
    className={`px-4 py-3.5 sm:px-6 sm:py-4.5 border-b border-slate-100 ${className}`}
  >
    <h3 className="font-bold text-slate-900 text-sm sm:text-base">{title}</h3>
    {subtitle && (
      <p className="text-[11px] sm:text-xs text-slate-500 mt-1">{subtitle}</p>
    )}
  </div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 sm:p-6 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div
    className={`px-4 py-3.5 sm:px-6 sm:py-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-2 sm:gap-3 ${className}`}
  >
    {children}
  </div>
);
