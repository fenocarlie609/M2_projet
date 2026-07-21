const jwt = require("jsonwebtoken");
const { prisma } = require("../../config/database");
const { comparePassword } = require("../../common/utils/password.utils");
const AppError = require("../../common/utils/AppError");

const createToken = (payload) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "1h";
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  console.log("User found:", user); // Debug: Log the user object

  if (!user || user.deletedAt) {
    throw new AppError("Email ou mot de passe incorrect.", 401);
  }

  //   if (!user.isActive) {
  //     throw new AppError(
  //       "Votre compte n'est pas activé. Veuillez contacter un administrateur.",
  //       403,
  //     );
  //   }

  const passwordIsValid = await comparePassword(password, user.password);
  if (!passwordIsValid) {
    throw new AppError("Email ou mot de passe incorrect.", 401);
  }

  const token = createToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  user.password = undefined;

  return {
    user,
    token,
  };
};

module.exports = {
  loginUser,
};
