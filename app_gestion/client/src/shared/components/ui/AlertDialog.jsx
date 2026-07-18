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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-premium border border-slate-200/60 p-6 relative z-10 animate-[fadeIn_0.15s_ease-out]">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button variant={isDanger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
