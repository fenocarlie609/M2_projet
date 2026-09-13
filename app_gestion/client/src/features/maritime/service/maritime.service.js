import { createCrudService } from "@/shared/services/";

const resources = {
  vessels: createCrudService("/maritime/vessels"),
  ports: createCrudService("/maritime/ports"),
  voyages: createCrudService("/maritime/voyages"),
  vehicles: createCrudService("/maritime/vehicles"),
};

const getResourceItems = (response, resource) =>
  response?.data?.[resource] || [];

export const maritimeService = {
  async getAll(resource) {
    const response = await resources[resource].getAll();
    return getResourceItems(response, resource);
  },
  create: (resource, data) => resources[resource].create(data),
  update: (resource, id, data) => resources[resource].update(id, data),
  remove: (resource, id) => resources[resource].remove(id),
};
