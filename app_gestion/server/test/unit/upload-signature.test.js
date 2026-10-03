const test = require("node:test");
const assert = require("node:assert/strict");
const { detectImageExtension } = require("../../src/common/middlewares/upload.middleware");

test("détecte les signatures JPEG, PNG et WebP indépendamment du MIME déclaré", () => {
  assert.equal(
    detectImageExtension(Buffer.from([0xff, 0xd8, 0xff, 0xe0])),
    ".jpg",
  );
  assert.equal(
    detectImageExtension(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0]),
    ),
    ".png",
  );
  assert.equal(
    detectImageExtension(Buffer.from("RIFF0000WEBP")),
    ".webp",
  );
});

test("refuse un contenu non-image et des buffers incomplets", () => {
  assert.equal(detectImageExtension(Buffer.from("<script>alert(1)</script>")), null);
  assert.equal(detectImageExtension(Buffer.from([0xff, 0xd8])), null);
});
