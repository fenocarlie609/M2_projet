// src/features/driver/driver.controller.js
const catchAsync = require("../../common/utils/catchAsync");
const AppError = require("../../common/utils/AppError");
const driverService = require("./driver.service");

exports.create = catchAsync(async (req, res) => {
  const driver = await driverService.createDriver(req.body);
  res.status(201).json({ status: "success", data: { driver } });
});

exports.update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedDriver = await driverService.updateDriver(id, req.body);
  res.status(200).json({ status: "success", data: { driver: updatedDriver } });
});

exports.delete = catchAsync(async (req, res) => {
  await driverService.deleteDriver(req.params.id);
  res.status(204).json({ status: "success", data: null });
});

exports.getAll = catchAsync(async (req, res) => {
  const drivers = await driverService.getAllDrivers();
  res
    .status(200)
    .json({ status: "success", results: drivers.length, data: { drivers } });
});

exports.getById = catchAsync(async (req, res, next) => {
  const driver = await driverService.getDriverById(req.params.id);
  if (!driver) return next(new AppError("Chauffeur non trouvé.", 404));
  res.status(200).json({ status: "success", data: { driver } });
});
