const test = require("node:test");
const assert = require("node:assert/strict");
const { profileFields } = require("../src/utils/profileFields");

test("profile updates trim editable fields and exclude account privileges", () => {
  assert.deepEqual(profileFields({ username: " Ana ", ubication: " Córdoba ", rol: "admin", plan: "premium", email: "other@example.com" }), { username: "Ana", ubication: "Córdoba" });
});
test("profile updates reject empty, oversized and invalid values", () => {
  for (const data of [{ username: " " }, { ubication: 123 }, { username: "a".repeat(256) }, { image: "javascript:alert(1)" }, { image: "https://" }]) {
    assert.throws(() => profileFields(data), { status: 400 });
  }
});
test("profile updates allow removing photos and partial updates", () => {
  assert.deepEqual(profileFields({ image: null }), { image: null });
  assert.deepEqual(profileFields({ image: "" }), { image: "" });
  assert.deepEqual(profileFields({ image: "https://example.com/photo.jpg" }), { image: "https://example.com/photo.jpg" });
});
