const test = require("node:test");
const assert = require("node:assert/strict");
const {
  clientValidation,
} = require("../../src/modules/clients/client.validation");

const parseClient = (value) => clientValidation.create.body.parse(value);

test("accepte un particulier avec CIN et adresse", () => {
  const client = parseClient({
    name: "Jean Rakoto",
    type: "INDIVIDUAL",
    cin: "101010101010",
    addresses: [
      {
        type: "BOTH",
        addressLine1: "Rue de Test",
        city: "Toamasina",
      },
    ],
  });

  assert.equal(client.type, "INDIVIDUAL");
  assert.equal(client.addresses.length, 1);
});

test("accepte une entreprise avec NIF, STAT et document", () => {
  const client = parseClient({
    name: "Societe Test",
    type: "COMPANY",
    nif: "NIF-TEST",
    stat: "STAT-TEST",
    email: "contact@test.mg",
    documents: [
      {
        documentType: "NIF",
        documentNumber: "NIF-TEST",
      },
    ],
  });

  assert.equal(client.type, "COMPANY");
  assert.equal(client.currency, "MGA");
  assert.equal(client.documents[0].documentType, "NIF");
});

test("exige le motif lorsqu'une entreprise est exonérée", () => {
  assert.throws(() =>
    parseClient({
      name: "Entreprise Exoneree",
      type: "COMPANY",
      taxExempt: true,
    }),
  );
});

test("valide les types d'adresses et les emails", () => {
  assert.throws(() =>
    parseClient({
      name: "Client Invalide",
      email: "email-invalide",
    }),
  );

  assert.throws(() =>
    parseClient({
      name: "Client Invalide",
      addresses: [{ type: "UNKNOWN", addressLine1: "Rue Test" }],
    }),
  );
});
