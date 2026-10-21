const test = require("node:test");
const assert = require("node:assert/strict");

const {
  warehouseValidation,
  STATUTS_ARTICLE,
} = require("../../src/modules/warehouse/warehouse.validation");

const { redactSensitiveValues } = require("../../src/common/middlewares/audit.middleware");

test("un entrepot exige un code et un nom", () => {
  assert.throws(() =>
    warehouseValidation.create.body.parse({ name: "Dépôt" }),
  );
  assert.throws(() =>
    warehouseValidation.create.body.parse({ code: "ANT-01" }),
  );
});

test("le code d'un entrepot est normalise en majuscules", () => {
  const entrepot = warehouseValidation.create.body.parse({
    code: "ant-01",
    name: "Dépôt d'Antananarivo",
  });
  assert.equal(entrepot.code, "ANT-01");
});

test("la capacite d'un entrepot est strictement positive", () => {
  assert.throws(() =>
    warehouseValidation.create.body.parse({
      code: "ANT-01",
      name: "Dépôt",
      capacityTons: 0,
    }),
  );
  assert.throws(() =>
    warehouseValidation.create.body.parse({
      code: "ANT-01",
      name: "Dépôt",
      capacityTons: -5,
    }),
  );
});

test("une entree en entrepot exige un entrepot, un client, un poids et des colis", () => {
  const valide = {
    warehouseId: "entrepot-1",
    clientId: "client-1",
    description: "Café vert",
    packageCount: 10,
    weightKg: 2500,
  };

  const entrepot = warehouseValidation.item.body.parse(valide);
  assert.equal(entrepot.packageCount, 10);
  assert.equal(entrepot.weightKg, 2500);

  assert.throws(() =>
    warehouseValidation.item.body.parse({ ...valide, warehouseId: "" }),
  );
  assert.throws(() =>
    warehouseValidation.item.body.parse({ ...valide, clientId: "" }),
  );
  assert.throws(() =>
    warehouseValidation.item.body.parse({ ...valide, weightKg: 0 }),
  );
  assert.throws(() =>
    warehouseValidation.item.body.parse({ ...valide, packageCount: 0 }),
  );
});

test("le reembarquement exige un plan de chargement", () => {
  assert.throws(() => warehouseValidation.embark.body.parse({}));
  const embarquement = warehouseValidation.embark.body.parse({
    loadingPlanId: "plan-1",
  });
  assert.equal(embarquement.loadingPlanId, "plan-1");
});

test("les trois statuts d'une marchandise sont definis", () => {
  assert.deepEqual(STATUTS_ARTICLE, ["IN_STOCK", "EMBARKED", "PICKED_UP"]);
});

test("le journal d'audit serialise les valeurs decimales et les dates", () => {
  const decimal = { toJSON: () => "2500.50" };
  const date = new Date("2026-10-21T08:00:00.000Z");

  const journalise = redactSensitiveValues({
    total: decimal,
    date: date,
    imbrique: { poids: decimal },
  });

  assert.equal(journalise.total, "2500.50");
  assert.equal(journalise.date, "2026-10-21T08:00:00.000Z");
  assert.equal(journalise.imbrique.poids, "2500.50");
  assert.doesNotThrow(() => JSON.stringify(journalise));
});

test("le journal d'audit masque toujours les secrets", () => {
  const journalise = redactSensitiveValues({
    password: "secret",
    token: "abc",
    email: "a@b.mg",
  });
  assert.equal(journalise.password, "[REDACTED]");
  assert.equal(journalise.token, "[REDACTED]");
  assert.equal(journalise.email, "a@b.mg");
});
