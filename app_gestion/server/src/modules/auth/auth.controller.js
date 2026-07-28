const catchAsync = require("../../common/utils/catchAsync");
const authService = require("./auth.service");
const { getIO } = require("../../config/socket");

const parseJwtExpiration = (expiresIn) => {
  if (!expiresIn) return 24 * 60 * 60 * 1000;

  const match = expiresIn.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return Number(expiresIn) * 1000 || 24 * 60 * 60 * 1000;

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    s: 1000,
    m: 60 * 1000, // 1 minute = 60 000 m
    h: 60 * 60 * 1000, // 1 heure = 3 600 000 ms
    d: 24 * 60 * 60 * 1000, // 1 jour = 86 400 000 ms
  };

  return value * multipliers[unit];
};

const cookieOptions = {
  httpOnly: true,
  secure: false, // En développement, toujours false
  signed: true,
  sameSite: "lax",
  path: "/",
};

exports.login = catchAsync(async (req, res) => {
  const { employee, token } = await authService.loginEmployee(req.body);

  res.cookie("token", token, {
    ...cookieOptions,
    maxAge: parseJwtExpiration(process.env.JWT_EXPIRES_IN),
  });

  console.log(
    parseJwtExpiration(process.env.JWT_EXPIRES_IN),
    " et ",
    process.env.JWT_EXPIRES_IN,
  );

  res.status(200).json({
    status: "success",
    token,
    data: { employee },
  });
});

exports.me = catchAsync(async (req, res) => {
  // 1. Appel au service (si une erreur survient, elle est catchée automatiquement)
  const user = await authService.getFreshProfile(req.user.id);

  // 2. Réponse propre uniquement pour le succès
  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.test = catchAsync(async (req, res) => {
  // 1. Récupérer l'instance globale de Socket.IO
  const io = getIO();

  // 2. Récupérer le profil ultra-propre (sans mot de passe, sans ID inutiles)
  // On utilise l'ID de test présent dans ton terminal
  const targetEmployeeId = "388e908f-e395-4c68-b23b-898c62a8dcb2";
  const updatedProfile = await authService.getFreshProfile(targetEmployeeId);

  // 3. Pousser les données sur le canal privé de cet employé
  io.to(`employee_${targetEmployeeId}`).emit("profile-updated", updatedProfile);

  // 4. Réponse HTTP classique pour Postman
  res.status(200).json({
    status: "success",
    message: "Notification temps réel envoyée avec succès !",
  });
});

exports.logout = catchAsync(async (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.status(200).json({
    status: "success",
    message: "Déconnexion réussie.",
  });
});
