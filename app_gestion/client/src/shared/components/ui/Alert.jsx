// src/shared/components/ui/Alert.jsx
import React from "react";
import { FiAlertCircle, FiCheckCircle, FiInfo } from "react-icons/fi";

export const Alert = ({ children, title, variant = "info" }) => {
  const variants = {
    success: {
      bg: "bg-emerald-50/80 border-emerald-200 text-emerald-800",
      icon: FiCheckCircle,
    },
    error: {
      bg: "bg-rose-50/80 border-rose-200 text-rose-800",
      icon: FiAlertCircle,
    },
    info: { bg: "bg-blue-50/80 border-blue-200 text-blue-800", icon: FiInfo },
  };

  const { bg, icon: Icon } = variants[variant];

  return (
    <div
      className={`flex gap-3.5 p-4 rounded-xl border ${bg} text-sm font-medium animate-[fadeIn_0.2s_ease-out]`}
    >
      <Icon className="shrink-0 mt-0.5" size={18} />
      <div className="flex flex-col gap-1">
        {title && <span className="font-bold tracking-wide">{title}</span>}
        <div className="text-current opacity-90 font-sans">{children}</div>
      </div>
    </div>
  );
};
