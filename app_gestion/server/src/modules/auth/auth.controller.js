const catchAsync = require("../../common/utils/catchAsync");
const authService = require("./auth.service");
const { getIO } = require("../../config/socket");
const {
  generateCsrfToken,
} = require("../../common/middlewares/csrf.middleware");

const parseJwtExpiration = (expiresIn) => {
  if (!expiresIn) return 24 * 60 * 60 * 1000;

  const match = expiresIn.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return Number(expiresIn) * 1000 || 24 * 60 * 60 * 1000;

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

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  signed: true,
  sameSite: "lax",
  path: "/",
};

const csrfCookieOptions = {
  httpOnly: false,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  signed: true,
  sameSite: "lax",
  path: "/",
};

exports.getCsrfToken = catchAsync(async (req, res) => {
  const csrfToken = generateCsrfToken();

  res.cookie("xsrf-token", csrfToken, {
    ...csrfCookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    data: { csrfToken },
  });
});

exports.login = catchAsync(async (req, res) => {
  const { employee, token, refreshToken } = await authService.loginEmployee(req.body);
  const jwtMaxAge = parseJwtExpiration(process.env.JWT_EXPIRES_IN);
  const refreshMaxAge = parseJwtExpiration(process.env.JWT_REFRESH_EXPIRES_IN || "7d");

  res.cookie("token", token, {
    ...cookieOptions,
    maxAge: jwtMaxAge,
  });

  res.cookie("refreshToken", refreshToken, {
    ...refreshCookieOptions,
    maxAge: refreshMaxAge,
  });

  const csrfToken = generateCsrfToken();
  res.cookie("xsrf-token", csrfToken, {
    ...csrfCookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    data: { employee },
  });
});

exports.refresh = catchAsync(async (req, res) => {
  const refreshToken =
    req.signedCookies?.refreshToken || req.cookies?.refreshToken || null;

  const { accessToken, refreshToken: rotatedRefreshToken } =
    await authService.rotateRefreshToken(refreshToken);

  const jwtMaxAge = parseJwtExpiration(process.env.JWT_EXPIRES_IN);
  const refreshMaxAge = parseJwtExpiration(process.env.JWT_REFRESH_EXPIRES_IN || "7d");

  res.cookie("token", accessToken, {
    ...cookieOptions,
    maxAge: jwtMaxAge,
  });

  res.cookie("refreshToken", rotatedRefreshToken, {
    ...refreshCookieOptions,
    maxAge: refreshMaxAge,
  });

  res.status(200).json({
    status: "success",
  });
});

exports.me = catchAsync(async (req, res) => {
  const user = await authService.getFreshProfile(req.user.id);

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.test = catchAsync(async (req, res) => {
  const io = getIO();
  const targetEmployeeId = "388e908f-e395-4c68-b23b-898c62a8dcb2";
  const updatedProfile = await authService.getFreshProfile(targetEmployeeId);

  io.to(`employee_${targetEmployeeId}`).emit("profile-updated", updatedProfile);

  res.status(200).json({
    status: "success",
    message: "Notification temps réel envoyée avec succès !",
  });
});

exports.logout = catchAsync(async (req, res) => {
  const employeeId = req.user?.id;

  if (employeeId) {
    await authService.revokeEmployeeRefreshTokens(employeeId, "logout");
  }

  res.clearCookie("token", cookieOptions);
  res.clearCookie("refreshToken", refreshCookieOptions);
  res.clearCookie("xsrf-token", csrfCookieOptions);

  res.status(200).json({
    status: "success",
    message: "Déconnexion réussie.",
  });
});
