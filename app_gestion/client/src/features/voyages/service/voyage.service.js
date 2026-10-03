import { createCrudService } from "@/shared/services/";

const voyageCrud = createCrudService("/voyages");

export const voyageService = {
  getVoyages: () => voyageCrud.getAll(),
  getVoyageById: (id) => voyageCrud.getById(id),
  createVoyage: (data) => voyageCrud.create(data),
  updateVoyage: (id, data) => voyageCrud.update(id, data),
  deleteVoyage: (id) => voyageCrud.remove(id),
};
