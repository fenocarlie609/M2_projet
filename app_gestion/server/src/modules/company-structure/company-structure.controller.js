// src/features/company-structure/company-structure.controller.js
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

exports.createPosition = catchAsync(async (req, res) => {
  const { departmentId } = req.params;
  const position = await companyStructureService.createPosition(
    departmentId,
    req.body,
  );

  res.status(201).json({
    status: "success",
    data: { position },
  });
});
