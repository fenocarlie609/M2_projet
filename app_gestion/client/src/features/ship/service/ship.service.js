// src/features/ship/service/ship.service.js
import { createCrudService } from "@/shared/services/";

const shipCrud = createCrudService("/maritime/vessels");

export const shipService = {
  getShips: () => shipCrud.getAll(),
  getShipById: (id) => shipCrud.getById(id),
  createShip: (data) => shipCrud.create(data),
  updateShip: (id, data) => shipCrud.update(id, data),
  deleteShip: (id) => shipCrud.remove(id),
};
