// src/features/companyStructure/service/companyStructure.service.js
import axiosInstance from "@/shared/services/axiosInstance";

export const companyStructureService = {
  getStructure: async () => {
    const response = await axiosInstance.get("/company-structure");
    return response.data;
  },

  createDepartment: async (data) => {
    const response = await axiosInstance.post(
      "/company-structure/departments",
      data,
    );
    return response.data;
  },

  updateDepartment: async (id, data) => {
    const response = await axiosInstance.put(
      `/company-structure/departments/${id}`,
      data,
    );
    return response.data;
  },

  deleteDepartment: async (id) => {
    return await axiosInstance.delete(`/company-structure/departments/${id}`);
  },

  createPosition: async (data) => {
    const response = await axiosInstance.post(
      "/company-structure/positions",
      data,
    );
    return response.data;
  },

  updatePosition: async (id, data) => {
    const response = await axiosInstance.put(
      `/company-structure/positions/${id}`,
      data,
    );
    return response.data;
  },

  deletePosition: async (id) => {
    return await axiosInstance.delete(`/company-structure/positions/${id}`);
  },
};
