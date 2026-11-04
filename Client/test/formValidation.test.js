import { test } from "node:test";
import assert from "node:assert/strict";
import { emailError, passwordError, passwordRequirements, confirmPasswordError, errorMessage } from "../src/utils/formValidation.js";

test("accepts email aliases and long domain suffixes, rejects missing or malformed email", () => {
  assert.equal(emailError("  ana+circula@example.technology  "), "");
  for (const email of ["", "ana", "a@b", "a b@example.com", "a@@example.com", null]) assert.ok(emailError(email));
});

test("password feedback matches required characters and the UTF-8 bcrypt boundary", () => {
  assert.equal(passwordError("a1" + "x".repeat(70)), "");
  assert.ok(passwordError("a1" + "x".repeat(71)));
  assert.equal(passwordError("a1" + "é".repeat(35)), "");
  assert.ok(passwordError("a1" + "é".repeat(36)));
  for (const value of ["", "abc1", "abcdefgh", "12345678", "abc12345\n"]) assert.ok(passwordError(value));
  assert.deepEqual(passwordRequirements("abc12345").map((rule) => rule.met), [true, true, true]);
  assert.ok(confirmPasswordError("", "secret1"));
  assert.ok(confirmPasswordError(" secret1", "secret1"));
  assert.equal(confirmPasswordError(" same1 ", " same1 "), "");
});

test("feedback preserves useful errors and hides configuration details", () => {
  assert.equal(errorMessage({ response: { data: { error: "Ese nombre de usuario ya está en uso." } } }), "Ese nombre de usuario ya está en uso.");
  assert.equal(errorMessage({ response: { data: { error: "Configurar BREVO_API_KEY" } } }, "Reintentá más tarde."), "Reintentá más tarde.");
  assert.match(errorMessage({ response: { status: 429 } }), /Esperá/);
  assert.match(errorMessage({ code: "ERR_NETWORK" }), /conexión/);
  assert.match(errorMessage({ response: { data: { error: "Missing credentials" } } }), /campos obligatorios/);
});
