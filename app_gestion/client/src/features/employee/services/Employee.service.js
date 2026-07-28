// src/features/employee/service/employee.service.js
import { axiosInstance } from "@/shared/services/";

export const employeeService = {
  getEmployees: async () => {
    const response = await axiosInstance.get("/employees");
    return response.data;
  },

  getEmployeeById: async (id) => {
    const response = await axiosInstance.get(`/employees/${id}`);
    return response.data;
  },

  createEmployee: async (data) => {
    const response = await axiosInstance.post("/employees", data);
    return response.data;
  },

  updateEmployee: async (id, data) => {
    const response = await axiosInstance.put(`/employees/${id}`, data);
    return response.data;
  },

  deleteEmployee: async (id) => {
    return await axiosInstance.delete(`/employees/${id}`);
  },

  /**
   * Upload multipart d'une photo d'identité.
   * - matricule : sert à nommer le fichier côté serveur (évite les doublons :
   *   un nouvel upload pour le même employé écrase l'ancien fichier).
   * - previousUrl : URL de l'ancienne photo (si on en remplace une), pour que
   *   le serveur la supprime si son nom diffère du nouveau fichier.
   * IMPORTANT : "matricule" doit être ajouté au FormData AVANT "avatar" pour
   * que multer puisse le lire au moment de nommer le fichier.
   */
  uploadAvatar: async (file, { matricule, previousUrl } = {}) => {
    const formData = new FormData();
    if (matricule) formData.append("matricule", matricule);
    if (previousUrl) formData.append("previousUrl", previousUrl);
    formData.append("avatar", file);

    const response = await axiosInstance.post("/uploads/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
