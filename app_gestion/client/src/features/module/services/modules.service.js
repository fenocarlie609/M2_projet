// src/features/module/services/modules.service.js
import { createCrudService } from "@/shared/services/";

const modulesCrud = createCrudService("/modules");

export const modulesService = {
  getModules: () => modulesCrud.getAll(),
  getModuleById: (id) => modulesCrud.getById(id),
  createModule: (data) => modulesCrud.create(data),
  updateModule: (id, data) => modulesCrud.update(id, data),
  deleteModule: (id) => modulesCrud.remove(id),
};
