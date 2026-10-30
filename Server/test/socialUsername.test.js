const test = require("node:test");
const assert = require("node:assert/strict");
const { buildUniqueSocialUsername } = require("../src/utils/socialUsername");

test("Google name has no identifier suffix when available", async () => {
  assert.equal(await buildUniqueSocialUsername("charlyklema", "test@example.com", async () => false), "charlyklema");
});

test("adds a number only for occupied names", async () => {
  const taken = new Set(["charlyklema", "charlyklema-2"]);
  assert.equal(await buildUniqueSocialUsername("charlyklema", "test@example.com", async (name) => taken.has(name)), "charlyklema-3");
});

test("preserves meaningful hyphens and falls back to email", async () => {
  assert.equal(await buildUniqueSocialUsername("María-Luz", "test@example.com", async () => false), "Maria-Luz");
  assert.equal(await buildUniqueSocialUsername(null, "charlyklema@example.com", async () => false), "charlyklema");
});
