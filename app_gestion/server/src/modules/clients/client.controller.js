// src/features/client/client.controller.js
const catchAsync = require("../../common/utils/catchAsync");
const AppError = require("../../common/utils/AppError");
const clientService = require("./client.service");

exports.create = catchAsync(async (req, res) => {
  const client = await clientService.createClient(req.body);

  res.status(201).json({
    status: "success",
    data: { client },
  });
});

exports.update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedData = await clientService.updateClient(id, req.body);

  res.status(200).json({
    status: "success",
    data: { client: updatedData },
  });
});

exports.delete = catchAsync(async (req, res) => {
  const { id } = req.params;
  await clientService.deleteClient(id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAll = catchAsync(async (req, res) => {
  const clients = await clientService.getAllClients();

  res.status(200).json({
    status: "success",
    results: clients.length,
    data: { clients },
  });
});

exports.getById = catchAsync(async (req, res, next) => {
  const client = await clientService.getClientById(req.params.id);

  if (!client) {
    return next(new AppError("Client non trouvé.", 404));
  }

  res.status(200).json({
    status: "success",
    data: { client },
  });
});
