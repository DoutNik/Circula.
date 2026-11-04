const { test } = require("node:test");
const assert = require("node:assert/strict");
const validInfo = require("../src/middleware/validInfo");
const { validatePostFields } = require("../src/utils/postFields");

function registration(body) {
  const req = { path: "/register", body };
  const res = { status(code) { this.code = code; return this; }, json(data) { this.data = data; } };
  let accepted = false;
  validInfo(req, res, () => { accepted = true; });
  return { accepted, body: req.body, ...res };
}
test("registration accepts email aliases, normalizes identity, preserves password", () => {
  const result = registration({ username: "  Ana  ", email: " Ana+Test@Example.technology ", password: " MySecret1 " });
  assert.equal(result.accepted, true);
  assert.deepEqual(result.body, { username: "Ana", email: "ana+test@example.technology", password: " MySecret1 " });
});
test("invalid registrations return Spanish field errors and enforce bcrypt byte length", () => {
  const missing = registration({});
  assert.equal(missing.code, 400);
  assert.deepEqual(Object.keys(missing.data.fieldErrors), ["username", "email", "password"]);
  const result = registration({ username: "Ana", email: "ana@example.com", password: "a1" + "é".repeat(36) });
  assert.equal(result.accepted, false);
  assert.match(result.data.fieldErrors.password, /demasiado larga/);
  assert.equal(registration({ username: "Ana", email: "ana@example.com", password: "a1" + "é".repeat(35) }).accepted, true);
  assert.equal(registration({ username: "Ana", email: "ana@example.com", password: "abc12345\n" }).accepted, false);
});
const post = { title: " Libro de cuentos ", description: "", category: "Libros", ubication: "Córdoba, Villa Carlos Paz", image: ["https://example.com/photo.jpg"] };
test("product validation accepts optional description and only returns editable fields", () => {
  assert.deepEqual(validatePostFields({ ...post, UserId: 999, rol: "admin" }), { ...post, title: "Libro de cuentos" });
});
test("invalid product fields are rejected before reaching the database", () => {
  assert.throws(() => validatePostFields({ title: "x", description: "x".repeat(251), category: "", ubication: "", image: ["javascript:alert(1)"] }), (error) => {
    assert.deepEqual(Object.keys(error.fieldErrors), ["title", "description", "category", "ubication", "images"]);
    return true;
  });
  assert.throws(() => validatePostFields({ ...post, image: Array(4).fill("https://example.com/photo.jpg") }));
});
