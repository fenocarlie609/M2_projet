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

exports.createLine = catchAsync(async (req, res) => {
  const line = await service.createLine(req.params.id, req.body, req.user.id);
  res.status(201).json({ status: "success", data: { cargoLine: line } });
});

exports.updateLine = catchAsync(async (req, res) => {
  const line = await service.updateLine(
    req.params.id,
    req.params.lineId,
    req.body,
  );
  res.status(200).json({ status: "success", data: { cargoLine: line } });
});

exports.removeLine = catchAsync(async (req, res) => {
  await service.deleteLine(req.params.id, req.params.lineId);
  res.status(204).send();
});

exports.validate = catchAsync(async (req, res) => {
  const plan = await service.validatePlan(req.params.id, req.user.id);
  res.status(200).json({ status: "success", data: { loadingPlan: plan } });
});
