const test = require("node:test");
const assert = require("node:assert/strict");

const {
  vesselValidation,
  portValidation,
  voyageValidation,
  vehicleValidation,
} = require("../../src/modules/maritime/maritime.validation");
const {
  LoadValidation,
  loadValidation,
} = require("../../src/modules/loading-plans/loading-plan.validation");

const parse = (schema, value) => schema.body.parse(value);

const validVessel = {
  name: "LCT TEST",
  registrationNumber: "TEST-001",
  capacityTons: 120,
};

test("valide un navire avec une capacité positive", () => {
  const vessel = parse(vesselValidation.create, validVessel);
  assert.equal(vessel.name, "LCT TEST");
  assert.equal(vessel.status, "ACTIVE");
});

test("refuse un navire sans nom ou avec une capacité négative", () => {
  assert.throws(() => parse(vesselValidation.create, { capacityTons: -1 }));
});

test("normalise le code d'un port en majuscules", () => {
  const port = parse(portValidation.create, {
    code: "mgtoa",
    name: "Toamasina",
  });
  assert.equal(port.code, "MGTOA");
});

test("refuse un voyage dont l'arrivée précède le départ", () => {
  assert.throws(() =>
    parse(voyageValidation.create, {
      vesselId: "vessel-id",
      departurePortId: "departure-id",
      arrivalPortId: "arrival-id",
      voyageNumber: "TEST-01",
      departureDate: "2026-09-20T08:00:00.000Z",
      arrivalDate: "2026-09-19T08:00:00.000Z",
    }),
  );
});

test("accepte un véhicule et normalise son immatriculation", () => {
  const vehicle = parse(vehicleValidation.create, {
    licensePlate: "1234 ab",
    capacityTons: 20,
  });
  assert.equal(vehicle.licensePlate, "1234 AB");
});

test("valide un plan de chargement par défaut", () => {
  const plan = parse(LoadValidation.create, {
    reference: "PL-TEST-001",
    voyageId: "voyage-id",
  });
  assert.equal(plan.status, false);
  assert.equal(plan.operationType, "LOAD");
});

test("accepte un plan de déchargement sans changer le modèle de marchandise", () => {
  const plan = parse(LoadValidation.create, {
    reference: "UN-TEST-001",
    voyageId: "voyage-id",
    operationType: "UNLOAD",
  });
  assert.equal(plan.operationType, "UNLOAD");
  assert.equal(plan.status, false);
});

test("valide une ligne de marchandise complète", () => {
  const load = parse(loadValidation.create, {
    clientId: "client-id",
    packageCount: "10",
    description: "Sacs de riz",
    weightKg: "2500.5",
  });
  assert.equal(load.packageCount, 10);
  assert.equal(load.weightKg, 2500.5);
  assert.equal(load.isHazardous, false);
  assert.equal(load.status, "PENDING");
});

test("refuse une ligne avec zéro colis ou zéro poids", () => {
  assert.throws(() =>
    parse(loadValidation.create, {
      clientId: "client-id",
      packageCount: 0,
      description: "Marchandise invalide",
      weightKg: 0,
    }),
  );
});

test("refuse un plan ou une ligne sans identifiant obligatoire", () => {
  assert.throws(() => parse(LoadValidation.create, { reference: "PL-TEST" }));
  assert.throws(() =>
    parse(loadValidation.create, {
      packageCount: 2,
      description: "Sacs",
      weightKg: 100,
    }),
  );
});
