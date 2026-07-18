import axiosInstance from "../../../shared/services/axiosInstance";

export const loginService = {
  login: async (email, password) => {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  logout: async () => {
    return await axiosInstance.post("/auth/logout");
  },
};
