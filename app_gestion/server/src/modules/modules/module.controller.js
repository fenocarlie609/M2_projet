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

exports.create = catchAsync(async (req, res) => {
  const appModule = await moduleService.createModule(req.body);

  res.status(201).json({
    status: "success",
    data: { module: appModule },
  });
});
