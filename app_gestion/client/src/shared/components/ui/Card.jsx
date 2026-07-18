// src/shared/components/ui/Card.jsx
import React from "react";

export const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white border border-slate-200/60 rounded-2xl shadow-premium overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, className = "" }) => (
  <div className={`px-6 py-4.5 border-b border-slate-100 ${className}`}>
    <h3 className="font-bold text-slate-900 text-base">{title}</h3>
    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
  </div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div
    className={`px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-3 ${className}`}
  >
    {children}
  </div>
);
