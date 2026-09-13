const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { prisma } = require("../../config/database");
const { comparePassword } = require("../../common/utils/password.utils");
const AppError = require("../../common/utils/AppError");

const getAccessTokenSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET est manquant dans l'environnement.", 500);
  }

  return process.env.JWT_SECRET;
};

const getRefreshTokenSecret = () => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new AppError(
      "JWT_REFRESH_SECRET est manquant dans l'environnement.",
      500,
    );
  }

  return process.env.JWT_REFRESH_SECRET;
};

const parseDurationToMs = (value) => {
  if (!value) {
    return 15 * 60 * 1000;
  }

  const match = String(value).match(/^(\d+)(s|m|h|d)$/);
  if (!match) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue * 1000 : 15 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
};

const getRefreshTokenLifetimeMs = () =>
  parseDurationToMs(process.env.JWT_REFRESH_EXPIRES_IN || "7d");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

const createAccessToken = (employee) => {
  return createToken(
    {
      id: employee.id,
      email: employee.email,
      type: "access",
    },
    getAccessTokenSecret(),
    process.env.JWT_EXPIRES_IN || "15m",
  );
};

const createRefreshToken = (employeeId, familyId = crypto.randomUUID()) => {
  const jti = crypto.randomUUID();
  const refreshToken = createToken(
    {
      sub: employeeId,
      jti,
      familyId,
      type: "refresh",
    },
    getRefreshTokenSecret(),
    process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  );

  return { token: refreshToken, jti, familyId };
};

const departmentSelect = { select: { code: true, label: true } };
const positionSelect = { select: { code: true, label: true } };

const revokeEmployeeRefreshTokens = async (employeeId, reason = "logout") => {
  await prisma.refreshToken.updateMany({
    where: {
      employeeId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });
};

const rotateRefreshToken = async (refreshTokenValue) => {
  if (!refreshTokenValue) {
    throw new AppError("Refresh token manquant.", 401);
  }

  const tokenHash = hashToken(refreshTokenValue);
  const currentToken = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      employee: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!currentToken) {
    throw new AppError("Refresh token invalide ou révoqué.", 401);
  }

  try {
    const payload = jwt.verify(refreshTokenValue, getRefreshTokenSecret());
    if (payload.type !== "refresh" || payload.sub !== currentToken.employeeId) {
      throw new Error("Invalid refresh payload");
    }
  } catch (error) {
    throw new AppError("Refresh token invalide ou expiré.", 401);
  }

  const result = await prisma.$transaction(async (tx) => {
    const newRefresh = createRefreshToken(
      currentToken.employeeId,
      currentToken.familyId,
    );
    const newExpiresAt = new Date(Date.now() + getRefreshTokenLifetimeMs());

    const createdRefresh = await tx.refreshToken.create({
      data: {
        employeeId: currentToken.employeeId,
        tokenHash: hashToken(newRefresh.token),
        familyId: newRefresh.familyId,
        jti: newRefresh.jti,
        expiresAt: newExpiresAt,
        lastUsedAt: new Date(),
      },
    });

    await tx.refreshToken.update({
      where: { id: currentToken.id },
      data: {
        revokedAt: new Date(),
        revokedReason: "rotated",
        replacedByTokenId: createdRefresh.id,
        lastUsedAt: new Date(),
      },
    });

    return {
      accessToken: createAccessToken({
        id: currentToken.employeeId,
        email: currentToken.employee.email,
      }),
      refreshToken: newRefresh.token,
    };
  });

  return result;
};

const loginEmployee = async ({ identifier, password }) => {
  const employee = await prisma.employee.findFirst({
    where: {
      OR: [{ email: identifier }, { matricule: identifier }],
    },
    select: {
      id: true,
      name: true,
      email: true,
      matricule: true,
      password: true,
      hasAppAccess: true,
      isActive: true,
      deletedAt: true,
      department: departmentSelect,
      permissions: { select: { module: true, action: true } },
    },
  });

  if (!employee || employee.deletedAt) {
    throw new AppError("Identifiant ou mot de passe incorrect.", 401);
  }

  if (!employee.hasAppAccess || !employee.password) {
    throw new AppError("Identifiant ou mot de passe incorrect.", 401);
  }

  const passwordIsValid = await comparePassword(password, employee.password);
  if (!passwordIsValid) {
    throw new AppError("Identifiant ou mot de passe incorrect.", 401);
  }

  if (!employee.isActive) {
    throw new AppError(
      "Votre compte n'est pas encore activé. Contactez un administrateur.",
      403,
    );
  }

  const accessToken = createAccessToken(employee);
  const refreshTokenData = createRefreshToken(employee.id);
  const expiresAt = new Date(Date.now() + getRefreshTokenLifetimeMs());

  await prisma.refreshToken.create({
    data: {
      employeeId: employee.id,
      tokenHash: hashToken(refreshTokenData.token),
      familyId: refreshTokenData.familyId,
      jti: refreshTokenData.jti,
      expiresAt,
      lastUsedAt: new Date(),
    },
  });

  employee.password = undefined;

  if (employee.email === identifier) {
    employee.matricule = undefined;
  } else {
    employee.email = undefined;
  }

  return {
    employee,
    token: accessToken,
    refreshToken: refreshTokenData.token,
  };
};

const getFreshProfile = async (employeeId) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      permissions: true,
      department: departmentSelect,
      position: positionSelect,
    },
  });

  if (!employee || employee.deletedAt) {
    throw new AppError("Cet employé n'existe plus ou a été supprimé.", 404);
  }

  employee.password = undefined;

  if (employee.permissions && Array.isArray(employee.permissions)) {
    employee.permissions = employee.permissions.map(({ module, action }) => ({
      module,
      action,
    }));
  }

  return employee;
};

module.exports = {
  loginEmployee,
  getFreshProfile,
  revokeEmployeeRefreshTokens,
  rotateRefreshToken,
};
