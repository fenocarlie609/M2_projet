// src/features/client/service/client.service.js
import { axiosInstance } from "@/shared/services/";

export const clientService = {
  getClients: async () => {
    const response = await axiosInstance.get("/clients");
    return response.data;
  },

  getClientById: async (id) => {
    const response = await axiosInstance.get(`/clients/${id}`);
    return response.data;
  },

  createClient: async (data) => {
    const response = await axiosInstance.post("/clients", data);
    return response.data;
  },

  updateClient: async (id, data) => {
    const response = await axiosInstance.put(`/clients/${id}`, data);
    return response.data;
  },

  deleteClient: async (id) => {
    return await axiosInstance.delete(`/clients/${id}`);
  },
};
