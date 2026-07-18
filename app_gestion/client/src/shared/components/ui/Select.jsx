// src/shared/components/ui/Select.jsx
import React from "react";

export const Select = ({
  label,
  error,
  options = [], // Array of { value: 'quai', label: 'À quai' }
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
      <div className="relative">
        <select
          id={id}
          className={`
            w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium transition-all duration-200 appearance-none
            focus:outline-none focus:bg-white focus:ring-2 cursor-pointer
            ${
              error
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-slate-200 focus:border-brand-primary focus:ring-brand-primary/10"
            }
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Flèche personnalisée */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-xs font-medium text-rose-500 px-0.5">
          {error}
        </span>
      )}
    </div>
  );
};
