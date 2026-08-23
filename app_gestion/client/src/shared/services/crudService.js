import axiosInstance from "./axiosInstance";

export const createCrudService = (basePath, customMethods = {}) => {
  const service = {
    getAll: async (config = {}) => {
      const response = await axiosInstance.get(basePath, config);
      return response.data;
    },

    getById: async (id, config = {}) => {
      const response = await axiosInstance.get(`${basePath}/${id}`, config);
      return response.data;
    },

    create: async (payload, config = {}) => {
      const response = await axiosInstance.post(basePath, payload, config);
      return response.data;
    },

    update: async (id, payload, config = {}) => {
      const response = await axiosInstance.put(
        `${basePath}/${id}`,
        payload,
        config,
      );
      return response.data;
    },

    remove: async (id, config = {}) => {
      return axiosInstance.delete(`${basePath}/${id}`, config);
    },
    ...customMethods,
  };

  return service;
};

export default createCrudService;
