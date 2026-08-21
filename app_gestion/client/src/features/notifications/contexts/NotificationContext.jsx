// src/features/notifications/contexts/NotificationContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "@/features/auth";
import { socket } from "@/shared/services/";
import { showToast } from "@/shared/utils/";
import { notificationsService } from "../service/notifications.service";

const NotificationContext = createContext(null);

// Une notification globale (targetModule: null) est vue par tout le monde.
// Sinon, il faut que l'utilisateur ait la permission (targetModule, targetAction)
// correspondante, ou un wildcard (module ou action "*").
const isNotificationRelevant = (notification, user) => {
  if (!notification.targetModule) return true;

  const permissions = user?.permissions || [];
  return permissions.some(
    (p) =>
      (p.module === "*" && p.action === "*") ||
      (p.module === notification.targetModule &&
        (notification.targetAction === null ||
          p.action === notification.targetAction ||
          p.action === "*")),
  );
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await notificationsService.getNotifications();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des notifications :",
        error,
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Chargement initial (et rechargement si l'utilisateur change, ex: login)
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user, fetchNotifications]);

  // Écoute temps réel : le backend diffuse à TOUS les sockets connectés
  // (voir notification.service.js), c'est ici qu'on filtre par permission.
  useEffect(() => {
    if (!user) return;

    const handleNewNotification = (notification) => {
      if (!isNotificationRelevant(notification, user)) return;

      setNotifications((prev) => [{ ...notification, isRead: false }, ...prev]);
      showToast.info(notification.message);
    };

    socket.on("notification:new", handleNewNotification);

    // Diffusé quand une notification est supprimée côté serveur (ex: accès
    // accordé, la demande n'a plus lieu d'être) : on la retire localement,
    // y compris chez les IT qui ne l'ont pas traitée eux-mêmes.
    const handleNotificationRemoved = ({ ids }) => {
      setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
    };
    socket.on("notification:removed", handleNotificationRemoved);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:removed", handleNotificationRemoved);
    };
  }, [user]);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await notificationsService.markAsRead(id);
    } catch (error) {
      console.error("Erreur lors du marquage comme lu :", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        refetch: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications doit être utilisé à l'intérieur d'un NotificationProvider",
    );
  }
  return context;
};
