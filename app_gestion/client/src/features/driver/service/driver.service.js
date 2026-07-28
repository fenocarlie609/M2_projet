// src/features/driver/service/driver.service.js
import { axiosInstance } from "@/shared/services/";

export const driverService = {
  getDrivers: async () => {
    const response = await axiosInstance.get("/drivers");
    return response.data;
  },
  createDriver: async (data) => {
    const response = await axiosInstance.post("/drivers", data);
    return response.data;
  },
  updateDriver: async (id, data) => {
    const response = await axiosInstance.put(`/drivers/${id}`, data);
    return response.data;
  },
  deleteDriver: async (id) => {
    return await axiosInstance.delete(`/drivers/${id}`);
  },
};
