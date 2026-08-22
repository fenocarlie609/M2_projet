// src/features/driver/service/driver.service.js
import { createCrudService } from "@/shared/services/";

const driverCrud = createCrudService("/drivers");

export const driverService = {
  getDrivers: () => driverCrud.getAll(),
  createDriver: (data) => driverCrud.create(data),
  updateDriver: (id, data) => driverCrud.update(id, data),
  deleteDriver: (id) => driverCrud.remove(id),
};
