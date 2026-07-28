// src/features/modules/service/modules.service.js
// (ou place-le où bon te semble, ex: src/shared/services/modules.service.js —
// ce n'est pas vraiment un "feature" à part entière)
import axiosInstance from "@/shared/services/axiosInstance";

export const modulesService = {
  getModules: async () => {
    const response = await axiosInstance.get("/modules");
    return response.data;
  },
};
