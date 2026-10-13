const cookie = require("cookie");
const cookieSignature = require("cookie-signature");
const jwt = require("jsonwebtoken");

const getSocketEmployeeId = (
  cookieHeader,
  { cookieSecret, jwtSecret } = {},
) => {
  if (!cookieHeader || !cookieSecret || !jwtSecret) return null;

  const cookies = cookie.parse(cookieHeader);
  const signedCookie = cookies.token;
  if (!signedCookie?.startsWith("s:")) return null;

  const token = cookieSignature.unsign(signedCookie.slice(2), cookieSecret);
  if (!token) return null;

  try {
    const payload = jwt.verify(token, jwtSecret);
    if (payload.type !== "access" || !payload.id) return null;
    return payload.id;
  } catch {
    return null;
  }
};

module.exports = { getSocketEmployeeId };
