// src/shared/components/ui/Modal.jsx
import React, { useEffect } from "react";
import { FiX } from "react-icons/fi";

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md", // max-w-md | max-w-lg | max-w-2xl
}) => {
  // Bloquer le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop flouté */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Conteneur de la Modale */}
      <div
        className={`w-full ${maxWidth} bg-white rounded-2xl shadow-premium border border-slate-200/60 flex flex-col relative z-10 animate-[fadeIn_0.2s_ease-out]`}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {children}
        </div>
      </div>
    </div>
  );
};
