// src/shared/components/ui/Stepper.jsx
import React from "react";
import { FiCheck } from "react-icons/fi";

export const Stepper = ({ steps = [], currentStep = 1 }) => {
  return (
    <div className="w-full flex items-center gap-3 sm:gap-4 py-3 overflow-x-auto custom-scrollbar no-scrollbar">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = currentStep > stepNumber;
        const isActive = currentStep === stepNumber;

        return (
          <div
            key={index}
            className="flex items-center gap-2 sm:gap-3 shrink-0 last:flex-initial"
          >
            <div
              className={`
              w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-bold text-xs border transition-all duration-300 shrink-0
              ${isCompleted ? "bg-brand-primary text-white border-brand-primary shadow-sm" : ""}
              ${isActive ? "bg-brand-primary/10 text-brand-primary border-brand-primary font-extrabold ring-4 ring-brand-primary/10" : ""}
              ${!isCompleted && !isActive ? "bg-slate-50 text-slate-400 border-slate-200" : ""}
            `}
            >
              {isCompleted ? <FiCheck size={12} /> : stepNumber}
            </div>
            <span
              className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isActive ? "text-slate-900" : "text-slate-400"}`}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <div className="h-px w-8 sm:w-12 bg-slate-200 shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
};
