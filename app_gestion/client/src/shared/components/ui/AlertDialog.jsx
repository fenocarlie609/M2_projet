// src/shared/components/ui/AlertDialog.jsx
import React, { useEffect } from "react";
import { Button } from "./Button";

export const AlertDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmer",
  isDanger = true,
}) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[55]"
        onClick={onClose}
      />
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-premium border border-slate-200/60 p-5 sm:p-6 relative z-[65] animate-[fadeIn_0.15s_ease-out]">
        <h3 className="text-sm sm:text-base font-bold text-slate-900">
          {title}
        </h3>
        <p className="text-[11px] sm:text-xs text-slate-500 mt-2 font-medium leading-relaxed">
          {description}
        </p>
        <div className="mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            variant={isDanger ? "danger" : "primary"}
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
