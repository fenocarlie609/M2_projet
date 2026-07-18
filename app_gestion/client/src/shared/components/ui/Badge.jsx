// src/shared/components/Badge.jsx
import React from "react";

export const Badge = ({
  children,
  variant = "info", // success | error | warning | info | navy
}) => {
  const variants = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    error: "bg-rose-50 text-rose-700 border-rose-200/60",
    warning: "bg-amber-50 text-amber-700 border-amber-200/60",
    info: "bg-blue-50 text-blue-700 border-blue-200/60",
    navy: "bg-indigo-50 text-indigo-900 border-indigo-200/60", // Utile pour les IDs de navires
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${variants[variant]}`}
    >
      {children}
    </span>
  );
};
