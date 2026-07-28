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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={`w-full ${maxWidth} max-h-[90vh] sm:max-h-[85vh] bg-white rounded-2xl shadow-premium border border-slate-200/60 flex flex-col relative z-10 animate-[fadeIn_0.2s_ease-out]`}
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4.5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate mr-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
