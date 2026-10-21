// src/modules/warehouse/warehouse.controller.js
const catchAsync = require("../../common/utils/catchAsync");
const { sendSuccess, sendCreated } = require("../../common/utils/response");
const warehouseService = require("./warehouse.service");

exports.getWarehouses = catchAsync(async (req, res) => {
  const warehouses = await warehouseService.getWarehouses();
  return sendSuccess(res, { data: { warehouses } });
});

exports.getWarehouse = catchAsync(async (req, res) => {
  const warehouse = await warehouseService.getWarehouse(req.params.id);
  return sendSuccess(res, { data: { warehouse } });
});

exports.createWarehouse = catchAsync(async (req, res) => {
  const warehouse = await warehouseService.createWarehouse(req.body);
  return sendCreated(res, { data: { warehouse } });
});

exports.updateWarehouse = catchAsync(async (req, res) => {
  const warehouse = await warehouseService.updateWarehouse(
    req.params.id,
    req.body,
  );
  return sendSuccess(res, { data: { warehouse } });
});

exports.deleteWarehouse = catchAsync(async (req, res) => {
  const warehouse = await warehouseService.deleteWarehouse(req.params.id);
  return sendSuccess(res, { data: { warehouse } });
});

exports.getItems = catchAsync(async (req, res) => {
  const items = await warehouseService.getItems({
    warehouseId: req.query.warehouseId,
    clientId: req.query.clientId,
    status: req.query.status,
  });
  return sendSuccess(res, { data: { items } });
});

exports.getItem = catchAsync(async (req, res) => {
  const item = await warehouseService.getItem(req.params.id);
  return sendSuccess(res, { data: { item } });
});

exports.getAvailableItems = catchAsync(async (req, res) => {
  const items = await warehouseService.getAvailableItems();
  return sendSuccess(res, { data: { items } });
});

exports.createItem = catchAsync(async (req, res) => {
  const item = await warehouseService.createItem(req.body, req.user.id);
  return sendCreated(res, { data: { item } });
});

exports.pickupItem = catchAsync(async (req, res) => {
  const item = await warehouseService.pickupItem(
    req.params.id,
    req.user.id,
    req.body,
  );
  return sendSuccess(res, {
    message: "Retrait enregistré : la marchandise a quitté l'entrepôt.",
    data: { item },
  });
});

exports.embarkItem = catchAsync(async (req, res) => {
  const item = await warehouseService.embarkItem(
    req.params.id,
    req.user.id,
    req.body,
  );
  return sendSuccess(res, {
    message: "Réembarquement enregistré : la marchandise repart au prochain voyage.",
    data: { item },
  });
});

exports.getMovements = catchAsync(async (req, res) => {
  const mouvements = await warehouseService.getMovements({
    warehouseId: req.query.warehouseId,
    type: req.query.type,
    take: req.query.take,
  });
  return sendSuccess(res, { data: { mouvements } });
});
