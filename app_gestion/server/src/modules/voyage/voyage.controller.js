const catchAsync = require("../../common/utils/catchAsync");
const voyageService = require("./voyage.service");

/**
 * Récupère tous les voyages
 */
exports.getAllVoyages = catchAsync(async (req, res) => {
  const voyages = await voyageService.getVoyages();

  res.status(200).json({
    status: "success",
    results: voyages.length,
    data: { voyages },
  });
});

/**
 * Récupère un voyage par son ID
 */
exports.getVoyageById = catchAsync(async (req, res) => {
  const voyage = await voyageService.getVoyageById(req.params.id);

  res.status(200).json({
    status: "success",
    data: { voyage },
  });
});

/**
 * Crée un nouveau voyage
 */
exports.createVoyage = catchAsync(async (req, res) => {
  const voyage = await voyageService.createVoyage(req.body);

  res.status(201).json({
    status: "success",
    data: { voyage },
  });
});

/**
 * Mettre à jour un voyage
 */
exports.updateVoyage = catchAsync(async (req, res) => {
  const voyage = await voyageService.updateVoyage(req.params.id, req.body);

  res.status(200).json({
    status: "success",
    data: { voyage },
  });
});

/**
 * Supprimer (soft delete) un voyage
 */
exports.deleteVoyage = catchAsync(async (req, res) => {
  await voyageService.deleteVoyage(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
