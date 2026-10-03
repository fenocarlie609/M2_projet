const catchAsync = require("../../common/utils/catchAsync");
const loadService = require("./load.service");

/**
 * Récupère tous les chargements
 */
exports.getAllLoads = catchAsync(async (req, res) => {
  const loads = await loadService.getLoads();

  res.status(200).json({
    status: "success",
    results: loads.length,
    data: { loads },
  });
});

/**
 * Récupère un chargement par son ID
 */
exports.getLoadById = catchAsync(async (req, res) => {
  const load = await loadService.getLoadById(req.params.id);

  res.status(200).json({
    status: "success",
    data: { load },
  });
});

/**
 * Crée un nouveau chargement
 */
exports.createLoad = catchAsync(async (req, res) => {
  const load = await loadService.createLoad(req.body);

  res.status(201).json({
    status: "success",
    data: { load },
  });
});

/**
 * Mettre à jour un chargement
 */
exports.updateLoad = catchAsync(async (req, res) => {
  const load = await loadService.updateLoad(req.params.id, req.body);

  res.status(200).json({
    status: "success",
    data: { load },
  });
});

/**
 * Supprimer (soft delete) un chargement
 */
exports.deleteLoad = catchAsync(async (req, res) => {
  await loadService.deleteLoad(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
