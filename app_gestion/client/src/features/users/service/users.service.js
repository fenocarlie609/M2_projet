// src/features/users/service/users.service.js
import axiosInstance from "@/shared/services/axiosInstance";

export const usersService = {
  getUsers: async () => {
    const response = await axiosInstance.get("/users");
    return response.data;
  },

  getUserById: async (employeeId) => {
    const response = await axiosInstance.get(`/users/${employeeId}`);
    return response.data;
  },

  grantAccess: async (employeeId, data) => {
    const response = await axiosInstance.post(
      `/users/${employeeId}/grant-access`,
      data,
    );
    return response.data;
  },

  revokeAccess: async (employeeId) => {
    return await axiosInstance.delete(`/users/${employeeId}/access`);
  },

  setStatus: async (employeeId, isActive) => {
    const response = await axiosInstance.patch(`/users/${employeeId}/status`, {
      isActive,
    });
    return response.data;
  },

  resetPassword: async (employeeId, password) => {
    const response = await axiosInstance.patch(
      `/users/${employeeId}/password`,
      { password },
    );
    return response.data;
  },

  assignPermission: async (employeeId, module, action) => {
    const response = await axiosInstance.post(
      `/users/${employeeId}/permissions`,
      { module, action },
    );
    return response.data;
  },

  revokePermission: async (employeeId, permissionId) => {
    return await axiosInstance.delete(
      `/users/${employeeId}/permissions/${permissionId}`,
    );
  },
};
