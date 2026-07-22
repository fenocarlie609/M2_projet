// src/features/employee/service/employee.service.js
import axiosInstance from "@/shared/services/axiosInstance";

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
};
