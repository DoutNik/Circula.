const { test } = require("node:test");
const assert = require("node:assert/strict");
const { authenticateEmail } = require("../src/utils/emailLogin");
const validInfo = require("../src/middleware/validInfo");

test("login middleware accepts email without username and rejects username-only requests", () => {
  let passed = false;
  const res = { status(code) { this.code = code; return this; }, json(message) { this.message = message; } };
  validInfo({ path: "/login", body: { email: "ana@example.com", password: "secret" } }, res, () => { passed = true; });
  assert.equal(passed, true);
  validInfo({ path: "/login", body: { username: "ana", password: "secret" } }, res, () => assert.fail("must reject"));
  assert.equal(res.code, 400);
  assert.match(res.message, /correo electrónico válido/);
});

test("email login normalizes casing and spaces without modifying the password", async () => {
  const account = { id: 1, origin: "DB", password: "hash" };
  const result = await authenticateEmail({ email: "  Ana@Example.com ", password: " secret " }, {
    findUser: async (email) => { assert.equal(email, "ana@example.com"); return account; },
    comparePassword: async (password, hash) => { assert.equal(password, " secret "); assert.equal(hash, "hash"); return true; },
  });
  assert.equal(result, account);
});

test("unknown email, wrong password and Google accounts have actionable errors", async () => {
  const credentials = { email: "ana@example.com", password: "secret" };
  await assert.rejects(authenticateEmail(credentials, { findUser: async () => null }), /No hay una cuenta registrada/);
  await assert.rejects(authenticateEmail(credentials, { findUser: async () => ({ origin: "DB", password: "hash" }), comparePassword: async () => false }), /contraseña es incorrecta/);
  await assert.rejects(authenticateEmail(credentials, { findUser: async () => ({ origin: "google" }) }), /Iniciar sesión con Google/);
});

test("invalid credentials never query the database", async () => {
  const deps = { findUser: () => { throw new Error("must not query"); } };
  for (const email of [undefined, {}, "username", "a@b"]) {
    await assert.rejects(authenticateEmail({ email, password: "secret" }, deps), /correo electrónico válido/);
  }
  await assert.rejects(authenticateEmail({ email: "a@b.com", password: "" }, deps), /Ingresá tu contraseña/);
});
