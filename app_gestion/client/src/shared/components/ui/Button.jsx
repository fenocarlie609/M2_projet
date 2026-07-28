// src/shared/components/Button.jsx
import React from "react";
import { FiLoader } from "react-icons/fi";
import { twMerge } from "tailwind-merge";

export const Button = ({
  children,
  variant = "primary", // primary | secondary | danger | ghost
  size = "md", // sm | md | lg
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = "",
  ...props
}) => {
  // Styles de base inspirés des standards SaaS premium
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer text-xs sm:text-sm tracking-wide";

  // Mappage des variantes avec tes couleurs obligatoires
  const variants = {
    primary:
      "bg-brand-primary text-white hover:bg-[#0b5442] hover:shadow-md hover:shadow-emerald-950/20 focus:ring-brand-primary/50",
    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 focus:ring-slate-300",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 hover:shadow-md hover:shadow-rose-950/20 focus:ring-rose-500/50",
    ghost:
      "text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
    md: "px-4 py-2.5 gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5 rounded-2xl",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={twMerge(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <FiLoader
          className="animate-spin text-current"
          size={size === "sm" ? 14 : 18}
        />
      ) : (
        Icon && <Icon className="text-current" size={size === "sm" ? 14 : 18} />
      )}
      <span>{children}</span>
    </button>
  );
};
