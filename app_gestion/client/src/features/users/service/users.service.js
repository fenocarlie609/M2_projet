// src/features/users/service/users.service.js
import axiosInstance from "@/shared/services/axiosInstance";

export const usersService = {
  getUsers: async () => {
    const response = await axiosInstance.get("/users");
    return response.data;
  },

  // Employés signalés par la RH (hasAppAccess = true) mais pas encore actifs :
  // candidats pour "Donner un accès".
  getPendingEmployees: async () => {
    const response = await axiosInstance.get("/users/pending");
    return response.data;
  },

  // Vue d'audit : toutes les permissions accordées, groupées par employé.
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
};
