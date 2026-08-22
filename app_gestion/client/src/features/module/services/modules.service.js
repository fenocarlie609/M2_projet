// src/features/module/services/modules.service.js
import { axiosInstance } from "@/shared/services/";

export const modulesService = {
  getModules: async () => {
    const response = await axiosInstance.get("/modules");
    return response.data;
  },

  getModuleById: async (id) => {
    const response = await axiosInstance.get(`/modules/${id}`);
    return response.data;
  },

  createModule: async (data) => {
    const response = await axiosInstance.post("/modules", data);
    return response.data;
  },

  updateModule: async (id, data) => {
    const response = await axiosInstance.put(`/modules/${id}`, data);
    return response.data;
  },

  deleteModule: async (id) => {
    return await axiosInstance.delete(`/modules/${id}`);
  },
};
