import test from "node:test";
import assert from "node:assert/strict";
import { retryLogin } from "../src/api/retryLogin.js";

test("recovers from startup 503 without repeating Google authentication", async () => {
  let requests = 0;
  let waiting = 0;
  const delays = [];
  const response = { data: { token: "test-session" } };
  const result = await retryLogin(async () => {
    if (++requests < 3) throw { response: { status: 503 } };
    return response;
  }, { onWaiting: () => waiting++, sleep: async (ms) => delays.push(ms) });
  assert.equal(result, response);
  assert.equal(requests, 3);
  assert.equal(waiting, 2);
  assert.deepEqual(delays, [2000, 4000]);
});

test("does not retry invalid credentials, throttling, or network failures", async () => {
  for (const error of [{ response: { status: 401 } }, { response: { status: 429 } }, new Error("offline")]) {
    let requests = 0;
    await assert.rejects(retryLogin(async () => { requests++; throw error; }), (caught) => caught === error);
    assert.equal(requests, 1);
  }
});

test("stops after bounded retries when the server remains unavailable", async () => {
  const error = { response: { status: 503 } };
  let requests = 0;
  await assert.rejects(retryLogin(async () => { requests++; throw error; }, {
    sleep: async () => {},
  }), (caught) => caught === error);
  assert.equal(requests, 7);
});
