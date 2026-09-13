import { createCrudService } from "@/shared/services/";
import axiosInstance from "@/shared/services/axiosInstance";

const planCrud = createCrudService("/loading-plans");

export const loadingPlanService = {
  async getPlans() {
    const response = await planCrud.getAll();
    return response?.data?.loadingPlans || [];
  },
  getPlanById: (id) => planCrud.getById(id),
  createPlan: (data) => planCrud.create(data),
  updatePlan: (id, data) => planCrud.update(id, data),
  deletePlan: (id) => planCrud.remove(id),
  async addLine(planId, data) {
    const response = await axiosInstance.post(
      `/loading-plans/${planId}/lines`,
      data,
    );
    return response.data;
  },
  async updateLine(planId, lineId, data) {
    const response = await axiosInstance.put(
      `/loading-plans/${planId}/lines/${lineId}`,
      data,
    );
    return response.data;
  },
  deleteLine: (planId, lineId) =>
    axiosInstance.delete(`/loading-plans/${planId}/lines/${lineId}`),
  async validatePlan(planId) {
    const response = await axiosInstance.post(
      `/loading-plans/${planId}/validate`,
    );
    return response.data;
  },
};
