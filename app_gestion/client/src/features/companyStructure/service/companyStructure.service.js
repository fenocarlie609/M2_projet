import { createCrudService, axiosInstance } from "@/shared/services/";

const departmentsCrud = createCrudService("/company-structure/departments");
const positionsCrud = createCrudService("/company-structure/positions");

export const companyStructureService = {
  getStructure: async () => {
    const response = await axiosInstance.get("/company-structure");
    return response.data;
  },
  createDepartment: (data) => departmentsCrud.create(data),
  updateDepartment: (id, data) => departmentsCrud.update(id, data),
  deleteDepartment: (id) => departmentsCrud.remove(id),
  createPosition: (data) => positionsCrud.create(data),
  updatePosition: (id, data) => positionsCrud.update(id, data),
  deletePosition: (id) => positionsCrud.remove(id),
};
