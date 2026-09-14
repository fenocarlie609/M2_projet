import { createCrudService, axiosInstance } from "@/shared/services/";

const employeeCrud = createCrudService("/employees");

export const employeeService = {
  getEmployees: () => employeeCrud.getAll(),
  getEmployeeById: (id) => employeeCrud.getById(id),
  createEmployee: (data) => employeeCrud.create(data),
  updateEmployee: (id, data) => employeeCrud.update(id, data),
  deleteEmployee: (id) => employeeCrud.remove(id),
  uploadAvatar: async (file, { matricule, previousUrl } = {}) => {
    const formData = new FormData();
    if (matricule) formData.append("matricule", matricule);
    if (previousUrl) formData.append("previousUrl", previousUrl);
    formData.append("avatar", file);
    const response = await axiosInstance.post("/uploads/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
