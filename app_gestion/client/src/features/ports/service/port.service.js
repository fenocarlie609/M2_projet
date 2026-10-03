// src/features/port/service/port.service.js
import { createCrudService } from "@/shared/services/";

const portCrud = createCrudService("/maritime/ports");

export const portService = {
  getPorts: () => portCrud.getAll(),
  getPortById: (id) => portCrud.getById(id),
  createPort: (data) => portCrud.create(data),
  updatePort: (id, data) => portCrud.update(id, data),
  deletePort: (id) => portCrud.remove(id),
};
