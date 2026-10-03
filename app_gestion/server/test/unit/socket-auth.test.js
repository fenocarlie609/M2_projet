const test = require("node:test");
const assert = require("node:assert/strict");
const cookieSignature = require("cookie-signature");
const jwt = require("jsonwebtoken");
const { getSocketEmployeeId } = require("../../src/common/utils/socketAuth");

const cookieSecret = "cookie-test-secret";
const jwtSecret = "jwt-test-secret";
const employeeId = "employee-123";

const cookieHeaderFor = (payload) => {
  const token = jwt.sign(payload, jwtSecret, { expiresIn: "1m" });
  const signedToken = cookieSignature.sign(token, cookieSecret);
  return `token=${encodeURIComponent(`s:${signedToken}`)}`;
};

test("authentifie un access token signé dans le cookie de session", () => {
  const cookieHeader = cookieHeaderFor({ id: employeeId, type: "access" });
  assert.equal(
    getSocketEmployeeId(cookieHeader, { cookieSecret, jwtSecret }),
    employeeId,
  );
});

test("refuse les cookies falsifiés, absents et les refresh tokens", () => {
  assert.equal(
    getSocketEmployeeId("token=s%3Ajunk.invalid", { cookieSecret, jwtSecret }),
    null,
  );
  assert.equal(getSocketEmployeeId("", { cookieSecret, jwtSecret }), null);
  assert.equal(
    getSocketEmployeeId(
      cookieHeaderFor({ sub: employeeId, type: "refresh" }),
      { cookieSecret, jwtSecret },
    ),
    null,
  );
});
