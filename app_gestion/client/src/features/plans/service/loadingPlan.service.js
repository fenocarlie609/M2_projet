import { createCrudService } from "@/shared/services/";
import axiosInstance from "@/shared/services/axiosInstance";

const planCrud = createCrudService("/loading-plans");

export const loadingPlanService = {
  async getPlans() {
    const response = await planCrud.getAll();
    return response?.data?.loadingPlans || [];
  },
  getPlanById: (id) => planCrud.getById(id),
  getPlanByReference: async (reference) => {
    const response = await axiosInstance.get(
      `/loading-plans/reference/${encodeURIComponent(reference)}`,
    );
    return response.data;
  },
  createPlan: (data) => planCrud.create(data),
  updatePlan: (id, data) => planCrud.update(id, data),
  deletePlan: (id) => planCrud.remove(id),
  async addLoad(planId, data) {
    const response = await axiosInstance.post(
      `/loading-plans/${planId}/loads`,
      data,
    );
    return response.data;
  },
  async updateLoad(planId, loadId, data) {
    const response = await axiosInstance.put(
      `/loading-plans/${planId}/loads/${loadId}`,
      data,
    );
    return response.data;
  },
  deleteLoad: (planId, loadId) =>
    axiosInstance.delete(`/loading-plans/${planId}/loads/${loadId}`),
  async validatePlan(planId) {
    const response = await axiosInstance.post(
      `/loading-plans/${planId}/validate`,
    );
    return response.data;
  },
};
