import { axiosInstance } from "@/shared/services/";

export const loginService = {
  login: async (identifier, password) => {
    const response = await axiosInstance.post("/auth/login", {
      identifier,
      password,
    });
    return response.data;
  },

  logout: async () => {
    return await axiosInstance.post("/auth/logout");
  },
};
