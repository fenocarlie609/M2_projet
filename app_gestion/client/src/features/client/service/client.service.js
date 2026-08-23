// src/features/client/service/client.service.js
import { createCrudService } from "@/shared/services/";

const clientCrud = createCrudService("/clients");

export const clientService = {
  getClients: () => clientCrud.getAll(),
  getClientById: (id) => clientCrud.getById(id),
  createClient: (data) => clientCrud.create(data),
  updateClient: (id, data) => clientCrud.update(id, data),
  deleteClient: (id) => clientCrud.remove(id),
};
