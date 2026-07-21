// src/features/user/services/userService.js
import axiosInstance from "@/shared/services/axiosInstance";

export const userService = {
  /**
   * Récupère la liste de tous les utilisateurs actifs
   */
  getUsers: async () => {
    const response = await axiosInstance.get("/users");
    return response.data;
  },

  /**
   * Crée un nouvel utilisateur
   * Mappe sur la route d'enregistrement du back
   */
  createUser: async (userData) => {
    return await axiosInstance.post("/users/register", userData);
  },

  /**
   * Met à jour les informations d'un utilisateur
   */
  updateUser: async (id, updateData) => {
    return await axiosInstance.put(`/users/${id}`, updateData);
  },

  /**
   * Supprime logiquement un utilisateur (Soft Delete)
   */
  deleteUser: async (id) => {
    return await axiosInstance.delete(`/users/${id}`);
  },
};
