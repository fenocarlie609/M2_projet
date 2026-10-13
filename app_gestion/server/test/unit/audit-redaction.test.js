const test = require("node:test");
const assert = require("node:assert/strict");
const { redactSensitiveValues } = require("../../src/common/middlewares/audit.middleware");

test("masque les secrets dans les objets imbriqués et tableaux", () => {
  const sanitized = redactSensitiveValues({
    identifier: "employee@example.test",
    password: "dont-log-me",
    refreshToken: "refresh-secret",
    nested: [{ csrfToken: "csrf-secret", label: "safe" }],
  });

  assert.deepEqual(sanitized, {
    identifier: "employee@example.test",
    password: "[REDACTED]",
    refreshToken: "[REDACTED]",
    nested: [{ csrfToken: "[REDACTED]", label: "safe" }],
  });
});
