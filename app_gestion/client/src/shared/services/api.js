import axiosInstance from "./axiosInstance";

const request = async (method, url, payload, config = {}) => {
  return axiosInstance({
    method,
    url,
    ...(payload !== undefined && method !== "get" ? { data: payload } : {}),
    ...(method === "get" && payload ? { params: payload } : {}),
    ...config,
  });
};

export const api = {
  get: (url, config) => request("get", url, undefined, config),
  post: (url, payload, config) => request("post", url, payload, config),
  put: (url, payload, config) => request("put", url, payload, config),
  patch: (url, payload, config) => request("patch", url, payload, config),
  delete: (url, payload, config) => request("delete", url, payload, config),
};

export default api;
