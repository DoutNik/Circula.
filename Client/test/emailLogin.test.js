import { after, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";

let calls;
let response;
let loginError;
let firebaseError;
const firebaseAuth = {};
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

mock.module("../src/api/api.js", {
  defaultExport: { async post(path, body) {
    calls.push(["login", path, body]);
    if (loginError) throw loginError;
    return { data: response };
  } },
});
mock.module("../src/firebase.js", { namedExports: { auth: firebaseAuth } });
mock.module("firebase/auth", { namedExports: {
  async signInWithCustomToken(auth, token) {
    assert.equal(auth, firebaseAuth);
    calls.push(["firebase", token]);
    if (firebaseError) throw firebaseError;
  },
} });
const { loginWithEmail } = await import("../src/api/emailLogin.js");

beforeEach(() => {
  calls = [];
  response = { token: "test-api-token", firebaseToken: "test-firebase-token", usuario: { id: 7, username: "Prueba" } };
  loginError = undefined;
  firebaseError = undefined;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    setItem(key, value) { calls.push(["save", key, value]); },
  } });
});
after(() => {
  if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
  else delete globalThis.localStorage;
});
const credentials = { email: "  PRUEBA@example.com  ", password: "test-password" };

test("establishes Firebase before saving the API token and returns the profile", async () => {
  assert.deepEqual(await loginWithEmail(credentials), response.usuario);
  assert.deepEqual(calls, [
    ["login", "/users/login", { email: "prueba@example.com", password: "test-password" }],
    ["firebase", "test-firebase-token"],
    ["save", "token", "test-api-token"],
  ]);
});

test("an unverified email cannot create a session", async () => {
  loginError = Object.assign(new Error("Unverified"), { response: { status: 403 } });
  await assert.rejects(loginWithEmail(credentials), /Unverified/);
  assert.deepEqual(calls.map(([step]) => step), ["login"]);
});

test("a Firebase failure does not persist an API session", async () => {
  firebaseError = new Error("Firebase unavailable");
  await assert.rejects(loginWithEmail(credentials), /Firebase unavailable/);
  assert.deepEqual(calls.map(([step]) => step), ["login", "firebase"]);
});

test("an incomplete server response cannot create a session", async () => {
  delete response.firebaseToken;
  await assert.rejects(loginWithEmail(credentials), /No pudimos completar el acceso/);
  assert.deepEqual(calls.map(([step]) => step), ["login"]);
});
