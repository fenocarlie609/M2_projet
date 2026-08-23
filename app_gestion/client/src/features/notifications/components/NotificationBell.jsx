// src/features/notifications/components/NotificationBell.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import { useNotifications } from "../contexts/NotificationContext";

const formatRelativeTime = (dateString) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD} j`;
};

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) markAsRead(notification.id);
  };

  // "Traiter" une demande d'accès -> direction le module Utilisateurs, où
  // l'IT peut effectivement donner l'accès (GrantAccessModal).
  const handleTreat = (notification) => {
    markAsRead(notification.id);
    setIsOpen(false);
    navigate("/users");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-80 origin-top-right bg-white border border-slate-200/60 rounded-xl shadow-premium z-40 animate-[fadeIn_0.1s_ease-out] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Notifications
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-400">
                Aucune notification.
              </p>
            )}

            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`px-4 py-3 border-b border-slate-50 last:border-0 cursor-pointer transition-colors hover:bg-slate-50 ${
                  notification.isRead ? "bg-white" : "bg-brand-primary/5"
                }`}
              >
                <div className="flex items-start gap-2">
                  {!notification.isRead && (
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 leading-snug">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[11px] text-slate-400">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                      {notification.type === "ACCESS_REQUEST" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTreat(notification);
                          }}
                          className="text-[11px] font-semibold text-brand-primary hover:underline"
                        >
                          Traiter
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
