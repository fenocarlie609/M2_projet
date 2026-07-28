// src/features/users/service/users.service.js
import { axiosInstance } from "@/shared/services/";

export const usersService = {
  getUsers: async () => {
    const response = await axiosInstance.get("/users");
    return response.data;
  },

  getPendingEmployees: async () => {
    const response = await axiosInstance.get("/users/pending");
    return response.data;
  },

  getAllPermissions: async () => {
    const response = await axiosInstance.get("/users/permissions");
    return response.data;
  },

  getUserById: async (employeeId) => {
    const response = await axiosInstance.get(`/users/${employeeId}`);
    return response.data;
  },

  grantAccess: async (employeeId, data) => {
    const response = await axiosInstance.post(
      `/users/${employeeId}/access`,
      data,
    );
    return response.data;
  },

  revokeAccess: async (employeeId) => {
    return await axiosInstance.delete(`/users/${employeeId}/access`);
  },

  setStatus: async (employeeId, isActive) => {
    const response = await axiosInstance.patch(`/users/${employeeId}/access`, {
      isActive,
    });
    return response.data;
  },

  resetPassword: async (employeeId, password) => {
    const response = await axiosInstance.patch(`/users/${employeeId}/access`, {
      password,
    });
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

  // Révocation groupée : DELETE avec un body { permissionIds } (axios
  // requiert de le passer dans `data` pour une requête DELETE).
  revokePermissions: async (employeeId, permissionIds) => {
    return await axiosInstance.delete(`/users/${employeeId}/permissions`, {
      data: { permissionIds },
    });
  },
};
