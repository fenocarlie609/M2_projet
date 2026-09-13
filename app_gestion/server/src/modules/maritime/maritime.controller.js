const catchAsync = require("../../common/utils/catchAsync");
const AppError = require("../../common/utils/AppError");
const maritimeService = require("./maritime.service");

const create = (resource, label) =>
  catchAsync(async (req, res) => {
    const item = await maritimeService.create(resource, req.body);

    res.status(201).json({
      status: "success",
      data: { [resource]: item },
    });
  });

const update = (resource, label) =>
  catchAsync(async (req, res) => {
    const item = await maritimeService.update(
      resource,
      req.params.id,
      req.body,
    );

    res.status(200).json({
      status: "success",
      data: { [resource]: item },
    });
  });

const remove = (resource, label) =>
  catchAsync(async (req, res) => {
    await maritimeService.remove(resource, req.params.id);
    res.status(204).send();
  });

const getAll = (resource) =>
  catchAsync(async (req, res) => {
    const items = await maritimeService.getAll(resource);

    res.status(200).json({
      status: "success",
      results: items.length,
      data: { [resource + "s"]: items },
    });
  });

const getById = (resource, label) =>
  catchAsync(async (req, res, next) => {
    const item = await maritimeService.getById(resource, req.params.id);

    if (!item) {
      return next(new AppError(`${label} non trouvé.`, 404));
    }

    res.status(200).json({
      status: "success",
      data: { [resource]: item },
    });
  });

module.exports = { create, update, remove, getAll, getById };
