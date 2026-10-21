// src/features/warehouse/service/warehouse.service.js
// Le service renvoie le corps de la reponse ({ status, data: { ... } }),
// comme les autres services de l'application : la page lit ensuite
// reponse.data.items, reponse.data.warehouses, etc.
import axiosInstance from "@/shared/services/axiosInstance";

const lire = async (url, config) => {
  const response = await axiosInstance.get(url, config);
  return response.data;
};

export const warehouseService = {
  // Entrepots
  getWarehouses: () => lire("/warehouse"),
  createWarehouse: (data) => axiosInstance.post("/warehouse", data),
  updateWarehouse: (id, data) =>
    axiosInstance.put(`/warehouse/${id}`, data),
  deleteWarehouse: (id) => axiosInstance.delete(`/warehouse/${id}`),

  // Marchandises en entrepot
  getItems: (filtres = {}) =>
    lire("/warehouse/items", { params: filtres }),
  getAvailableItems: () => lire("/warehouse/items/disponibles"),
  createItem: (data) => axiosInstance.post("/warehouse/items", data),
  pickupItem: (id, data = {}) =>
    axiosInstance.post(`/warehouse/items/${id}/pickup`, data),
  embarkItem: (id, data) =>
    axiosInstance.post(`/warehouse/items/${id}/embark`, data),

  // Mouvements
  getMovements: (filtres = {}) =>
    lire("/warehouse/items/movements", { params: filtres }),
};
