// src/features/warehouse/service/warehouse.service.js
import { api } from "@/shared/services";

export const warehouseService = {
  // Entrepots
  getWarehouses: () => api.get("/warehouse"),
  createWarehouse: (data) => api.post("/warehouse", data),
  updateWarehouse: (id, data) => api.put(`/warehouse/${id}`, data),
  deleteWarehouse: (id) => api.delete(`/warehouse/${id}`),

  // Marchandises en entrepot
  getItems: (filtres = {}) => api.get("/warehouse/items", { params: filtres }),
  createItem: (data) => api.post("/warehouse/items", data),
  pickupItem: (id, data = {}) => api.post(`/warehouse/items/${id}/pickup`, data),
  embarkItem: (id, data) => api.post(`/warehouse/items/${id}/embark`, data),

  // Mouvements
  getMovements: (filtres = {}) =>
    api.get("/warehouse/items/movements", { params: filtres }),
};
