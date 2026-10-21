const test = require("node:test");
const assert = require("node:assert/strict");

const {
  summarizeResponse,
  redactSensitiveValues,
} = require("../../src/common/middlewares/audit.middleware");

test("le journal d'audit ne conserve que l'identifiant de l'enregistrement", () => {
  const resume = summarizeResponse({
    status: "success",
    data: {
      warehouse: {
        id: "entrepot-1",
        code: "ANT-01",
        name: "Dépôt d'Antananarivo",
        capacityTons: { s: 1, e: 1, d: [500] },
        createdAt: new Date(),
      },
    },
  });

  assert.equal(resume.id, "entrepot-1");
  assert.equal(resume.code, "ANT-01");
  assert.equal(resume.name, "Dépôt d'Antananarivo");
  assert.equal("capacityTons" in resume, false);
  assert.doesNotThrow(() => JSON.stringify(resume));
});

test("le journal d'audit reste serialisable quand la reponse est vide", () => {
  const resume = summarizeResponse({ status: "success", data: {} });
  assert.ok(resume);
  assert.doesNotThrow(() => JSON.stringify(resume));
});

test("le journal d'audit ne divulgue pas les secrets de la reponse", () => {
  const journalise = redactSensitiveValues(summarizeResponse({
    status: "success",
    data: { employee: { id: "e-1", password: "secret", email: "a@b.mg" } },
  }));
  assert.equal(journalise.id, "e-1");
  assert.equal("password" in journalise, false);
});
