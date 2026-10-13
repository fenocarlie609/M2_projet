const test = require("node:test");
const assert = require("node:assert/strict");
const voyageRouter = require("../../src/modules/voyage/voyage.route");

const findRouteLayer = (router, method, path) =>
  router.stack.find(
    (layer) =>
      layer.route &&
      layer.route.path === path &&
      typeof layer.route.methods[method] === "boolean",
  );

const hasReadPermissionGuard = (routeLayer) =>
  routeLayer.route.stack.some((middleware) =>
    middleware.toString().includes(
      "Vous n'avez pas la permission d'effectuer cette action.",
    ),
  );

test("protège les lectures de voyage par VOYAGES:READ", () => {
  const listRoute = findRouteLayer(voyageRouter, "get", "/");
  const detailRoute = findRouteLayer(voyageRouter, "get", "/:id");

  assert.ok(listRoute, "route GET /voyages introuvable");
  assert.ok(detailRoute, "route GET /voyages/:id introuvable");
  assert.ok(
    hasReadPermissionGuard(listRoute),
    "GET /voyages doit passer par authorize(VOYAGES, READ)",
  );
  assert.ok(
    hasReadPermissionGuard(detailRoute),
    "GET /voyages/:id doit passer par authorize(VOYAGES, READ)",
  );
});
