import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

const getCookie = (name) => {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookie) return null;

  return decodeURIComponent(cookie.split("=")[1]);
};

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(async (config) => {
  const isMutatingRequest = ["post", "put", "patch", "delete"].includes(
    String(config.method || "get").toLowerCase(),
  );

  if (!isMutatingRequest) {
    return config;
  }

  const isAuthRoute =
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/csrf-token");

  if (isAuthRoute) {
    return config;
  }

  const csrfToken = getCookie("xsrf-token");

  if (csrfToken) {
    config.headers = {
      ...config.headers,
      "X-CSRF-Token": csrfToken,
    };
    return config;
  }

  try {
    const { data } = await axios.get(`${API_URL}/auth/csrf-token`, {
      withCredentials: true,
    });

    const tokenFromResponse = data?.data?.csrfToken || getCookie("xsrf-token");

    if (tokenFromResponse) {
      config.headers = {
        ...config.headers,
        "X-CSRF-Token": tokenFromResponse,
      };
    }
  } catch (error) {
    console.warn("CSRF token unavailable before mutating request.", error);
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest?._retry) {
      const isLoginRoute =
        originalRequest?.url?.includes("/auth/login") ||
        originalRequest?.url?.includes("/auth/refresh") ||
        originalRequest?.url?.includes("/auth/me");

      if (!isLoginRoute) {
        originalRequest._retry = true;

        try {
          await axiosInstance.post("/auth/refresh");
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.warn("⚠️ Échec de la rotation du refresh token :", refreshError);
          return Promise.reject(refreshError);
        }
      }
    }

    if (error.response && error.response.status === 401) {
      const isLoginRoute =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/me");

      if (!isLoginRoute) {
        console.warn("⚠️ Requête 401 détectée sur :", error.config.url);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
