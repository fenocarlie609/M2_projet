const test = require("node:test");
const assert = require("node:assert/strict");

const { possede, estTechnique } = require("../../src/modules/dashboard/dashboard.service");

const agentDeQuai = {
  id: "employe-quai",
  department: { code: "LOGISTICS", label: "Logistique" },
  permissions: [
    { module: "CLIENT", action: "READ" },
    { module: "LOADING_PLANS", action: "READ" },
    { module: "CARGO", action: "CREATE" },
  ],
};

const technicien = {
  id: "employe-tech",
  department: { code: "TECH", label: "Technologie" },
  permissions: [
    { module: "EMPLOYEES", action: "READ" },
    { module: "USERS", action: "READ" },
  ],
};

const administrateur = {
  id: "admin",
  department: { code: "TECH", label: "Technologie" },
  permissions: [{ module: "*", action: "*" }],
};

test("un droit de lecture accorde l'acces au bloc correspondant", () => {
  assert.equal(possede(agentDeQuai, "LOADING_PLANS"), true);
  assert.equal(possede(agentDeQuai, "LOADING_PLANS", "READ"), true);
  assert.equal(possede(agentDeQuai, "CLIENT"), true);
});

test("un module non accorde est refuse", () => {
  assert.equal(possede(agentDeQuai, "EMPLOYEES"), false);
  assert.equal(possede(agentDeQuai, "USERS"), false);
  assert.equal(possede(technicien, "LOADING_PLANS"), false);
  assert.equal(possede(technicien, "CLIENT"), false);
});

test("une action non accordee est refusee", () => {
  assert.equal(possede(agentDeQuai, "LOADING_PLANS", "DELETE"), false);
  assert.equal(possede(agentDeQuai, "CARGO", "CREATE"), true);
  assert.equal(possede(agentDeQuai, "CARGO", "DELETE"), false);
});

test("le joker accorde tous les droits", () => {
  assert.equal(possede(administrateur, "EMPLOYEES"), true);
  assert.equal(possede(administrateur, "LOADING_PLANS", "DELETE"), true);
});

test("le journal d'audit est reserve au departement technique", () => {
  assert.equal(estTechnique(technicien), true);
  assert.equal(estTechnique(agentDeQuai), false);
  assert.equal(estTechnique(administrateur), true);
});

test("un utilisateur sans permission ne recoit aucun bloc metier", () => {
  const sansDroit = { id: "invite", department: { code: "ADMIN" }, permissions: [] };
  assert.equal(possede(sansDroit, "CLIENT"), false);
  assert.equal(possede(sansDroit, "LOADING_PLANS"), false);
  assert.equal(estTechnique(sansDroit), false);
});
