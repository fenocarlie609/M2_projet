// src/shared/components/ui/Tabs.jsx
import React from "react";

export const Tabs = ({ tabs = [], activeTab, onChange, className = "" }) => {
  return (
    <div
      className={`flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`px-2.5 py-2 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer shrink-0 ${
              isActive
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
