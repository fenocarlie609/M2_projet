const catchAsync = require("../../common/utils/catchAsync");
const moduleService = require("./module.service");

exports.getAll = catchAsync(async (req, res) => {
  const modules = await moduleService.getAllModules();

  res.status(200).json({
    status: "success",
    results: modules.length,
    data: { modules },
  });
});

exports.getById = catchAsync(async (req, res) => {
  const appModule = await moduleService.getModuleById(req.params.id);

  res.status(200).json({
    status: "success",
    data: { module: appModule },
  });
});

exports.create = catchAsync(async (req, res) => {
  const appModule = await moduleService.createModule(req.body);

  res.status(201).json({
    status: "success",
    data: { module: appModule },
  });
});

exports.update = catchAsync(async (req, res) => {
  const appModule = await moduleService.updateModule(req.params.id, req.body);

  res.status(200).json({
    status: "success",
    data: { module: appModule },
  });
});

exports.delete = catchAsync(async (req, res) => {
  await moduleService.deleteModule(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
