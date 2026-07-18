// src/shared/components/ui/Input.jsx
import React from "react";

export const Input = ({
  label,
  error,
  type = "text",
  id,
  className = "",
  ...props
}) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-0.5"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        className={`
          w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium transition-all duration-200
          focus:outline-none focus:bg-white focus:ring-2
          ${
            error
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-200 focus:border-brand-primary focus:ring-brand-primary/10"
          }
        `}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-rose-500 px-0.5 animate-[fadeIn_0.2s_ease-out]">
          {error}
        </span>
      )}
    </div>
  );
};
