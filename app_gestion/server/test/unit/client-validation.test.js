const test = require("node:test");
const assert = require("node:assert/strict");
const {
  clientValidation,
} = require("../../src/modules/clients/client.validation");

const parseCreateClient = (value) => clientValidation.create.body.parse(value);
const parseUpdateClient = (value) => clientValidation.update.body.parse(value);

test("valide les informations de base d'un particulier", () => {
  const client = parseCreateClient({
    name: "Jean Rakoto",
    phone: "+261 34 00 000 00",
    email: "jean@test.mg",
    address: "Rue de Test, Toamasina",
  });

  assert.equal(client.type, "INDIVIDUAL");
  assert.equal(client.name, "Jean Rakoto");
  assert.equal(client.address, "Rue de Test, Toamasina");
});

test("accepte une entreprise avec le même formulaire minimal", () => {
  const client = parseCreateClient({
    name: "Societe Test",
    type: "COMPANY",
    email: "contact@test.mg",
  });

  assert.equal(client.type, "COMPANY");
  assert.equal(client.name, "Societe Test");
});

test("refuse les champs hors du contrat et les emails invalides", () => {
  assert.throws(() =>
    parseCreateClient({
      name: "Client Test",
      cin: "101010101010",
    }),
  );
  assert.throws(() =>
    parseCreateClient({
      name: "Client Test",
      email: "email-invalide",
    }),
  );
});

test("autorise une mise à jour partielle non vide", () => {
  assert.deepEqual(parseUpdateClient({ phone: "+261 34 00 000 00" }), {
    phone: "+261 34 00 000 00",
  });
  assert.throws(() => parseUpdateClient({}));
  assert.throws(() => parseCreateClient({ name: "   " }));
});