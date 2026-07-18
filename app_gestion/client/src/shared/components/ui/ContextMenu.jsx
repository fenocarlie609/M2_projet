// src/shared/components/ui/ContextMenu.jsx
import React, { useState, useEffect, useRef } from "react";

export const ContextMenu = ({ targetRef, items = [] }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      setVisible(true);
      setPosition({ x: e.clientX, y: e.clientY });
    };

    target.addEventListener("contextmenu", handleContextMenu);
    return () => target.removeEventListener("contextmenu", handleContextMenu);
  }, [targetRef]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setVisible(false);
    };
    if (visible) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      style={{ top: position.y, left: position.x }}
      className="fixed z-50 min-w-44 bg-white border border-slate-200/60 rounded-xl shadow-premium p-1.5 animate-[fadeIn_0.1s_ease-out]"
    >
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <button
            key={idx}
            onClick={() => {
              item.onClick();
              setVisible(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer
              ${item.variant === "danger" ? "text-rose-600 hover:bg-rose-50" : "text-slate-700 hover:bg-slate-50"}
            `}
          >
            {Icon && <Icon size={14} className="shrink-0" />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
