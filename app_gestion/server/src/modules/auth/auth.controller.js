const catchAsync = require("../../common/utils/catchAsync");
const authService = require("./auth.service");

const parseJwtExpiration = (expiresIn) => {
  if (!expiresIn) return 15 * 60 * 1000;

  const match = expiresIn.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return Number(expiresIn) * 1000 || 15 * 60 * 1000;

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
};

const cookieOptions = {
  httpOnly: true,
  secure: false, // En développement, toujours false
  signed: true,
  sameSite: "lax", // Changé de "none" à "lax" pour le dev local
  path: "/",
};

exports.login = catchAsync(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body);

  res.cookie("token", token, {
    ...cookieOptions,
    maxAge: parseJwtExpiration(process.env.JWT_EXPIRES_IN),
  });

  res.status(200).json({
    status: "success",
    token,
    data: { user },
  });
});

exports.me = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
});

exports.logout = catchAsync(async (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.status(200).json({
    status: "success",
    message: "Déconnexion réussie.",
  });
});
