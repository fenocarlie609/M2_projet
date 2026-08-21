// src/features/notifications/service/notifications.service.js
import axiosInstance from "@/shared/services/axiosInstance";

export const notificationsService = {
  getNotifications: async () => {
    const response = await axiosInstance.get("/notifications");
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return response.data;
  },
};
