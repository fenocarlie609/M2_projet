const catchAsync = require("../../common/utils/catchAsync");
const AppError = require("../../common/utils/AppError");
const service = require("./loading-plan.service");

exports.getAll = catchAsync(async (req, res) => {
  const plans = await service.getAllPlans();
  res
    .status(200)
    .json({
      status: "success",
      results: plans.length,
      data: { loadingPlans: plans },
    });
});

exports.getById = catchAsync(async (req, res, next) => {
  try {
    const plan = await service.getPlanById(req.params.id);
    res.status(200).json({ status: "success", data: { loadingPlan: plan } });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    throw error;
  }
});

exports.getByReference = catchAsync(async (req, res) => {
  const plan = await service.getPlanByReference(req.params.reference);
  res.status(200).json({ status: "success", data: { loadingPlan: plan } });
});

exports.create = catchAsync(async (req, res) => {
  const plan = await service.createPlan(req.body);
  res.status(201).json({ status: "success", data: { loadingPlan: plan } });
});

exports.update = catchAsync(async (req, res) => {
  const plan = await service.updatePlan(req.params.id, req.body);
  res.status(200).json({ status: "success", data: { loadingPlan: plan } });
});

exports.remove = catchAsync(async (req, res) => {
  await service.deletePlan(req.params.id);
  res.status(204).send();
});

exports.createLoad = catchAsync(async (req, res) => {
  const load = await service.createLoad(req.params.id, req.body, req.user.id);
  res.status(201).json({ status: "success", data: { load } });
});

exports.updateLoad = catchAsync(async (req, res) => {
  const load = await service.updateLoad(
    req.params.id,
    req.params.loadId,
    req.body,
  );
  res.status(200).json({ status: "success", data: { load } });
});

exports.removeLoad = catchAsync(async (req, res) => {
  await service.deleteLoad(req.params.id, req.params.loadId);
  res.status(204).send();
});

exports.validate = catchAsync(async (req, res) => {
  const plan = await service.validatePlan(req.params.id, req.user.id);
  res.status(200).json({ status: "success", data: { loadingPlan: plan } });
});
