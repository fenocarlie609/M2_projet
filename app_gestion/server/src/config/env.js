const requiredEnv = [
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "COOKIE_SECRET",
  "DATABASE_URL",
];

const validateEnv = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  return {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 5000),
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    cookieSecret: process.env.COOKIE_SECRET,
    databaseUrl: process.env.DATABASE_URL,
  };
};

module.exports = { validateEnv };
