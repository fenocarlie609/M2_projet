// src/modules/company-structure/company-structure.controller.js
const catchAsync = require("../../common/utils/catchAsync");
const companyStructureService = require("./company-structure.service");

exports.getStructure = catchAsync(async (req, res) => {
  const structure = await companyStructureService.getFullStructure();

  res.status(200).json({
    status: "success",
    results: structure.length,
    data: { structure },
  });
});

exports.getDepartment = catchAsync(async (req, res) => {
  const department = await companyStructureService.getDepartmentById(
    req.params.id,
  );

  res.status(200).json({
    status: "success",
    data: { department },
  });
});

exports.createDepartment = catchAsync(async (req, res) => {
  const department = await companyStructureService.createDepartment(req.body);

  res.status(201).json({
    status: "success",
    data: { department },
  });
});

exports.updateDepartment = catchAsync(async (req, res) => {
  const department = await companyStructureService.updateDepartment(
    req.params.id,
    req.body,
  );

  res.status(200).json({
    status: "success",
    data: { department },
  });
});

exports.deleteDepartment = catchAsync(async (req, res) => {
  await companyStructureService.deleteDepartment(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createPosition = catchAsync(async (req, res) => {
  const { departmentId } = req.body;
  const position = await companyStructureService.createPosition(
    departmentId,
    req.body,
  );

  res.status(201).json({
    status: "success",
    data: { position },
  });
});

exports.updatePosition = catchAsync(async (req, res) => {
  const position = await companyStructureService.updatePosition(
    req.params.id,
    req.body,
  );

  res.status(200).json({
    status: "success",
    data: { position },
  });
});

exports.deletePosition = catchAsync(async (req, res) => {
  await companyStructureService.deletePosition(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
