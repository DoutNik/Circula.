const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createVerificationCode } = require("../src/utils/verificationCode");
const user = { id: 42, email: "test@example.com" };
function fixture(overrides = {}) {
  let row, time = 1800000000000, marked = 0, code = "012345";
  const mails = [];
  let queue = Promise.resolve();
  const service = createVerificationCode({
    secret: "test-only-hmac-key", now: () => time, generateCode: () => code,
    sendMail: async (mail) => mails.push(mail), markVerified: async () => { marked++; },
    withLock: (_user, fn) => {
      const next = queue.then(() => fn(row && { ...row }, async (values) => { row = { ...values }; }));
      queue = next.catch(() => {}); return next;
    }, ...overrides,
  });
  return { service, mails, row: () => row, marked: () => marked, advance: (ms) => { time += ms; }, code: (next) => { code = next; } };
}
test("six digits including leading zero are mailed, stored only as keyed hash and accepted once", async () => {
  const f = fixture(); await f.service.send(user);
  assert.match(f.mails[0].text, /012345/);
  assert.doesNotMatch(f.mails[0].text, /https?:/);
  assert.equal(f.row().codeHash.length, 64);
  assert.ok(!JSON.stringify(f.row()).includes("012345"));
  assert.equal((await f.service.verify(user, "012345")).verified, true);
  await assert.rejects(f.service.verify(user, "012345"), /utilizado/);
  assert.equal(f.marked(), 1);
});
test("wrong attempts persist and the sixth try cannot succeed", async () => {
  const f = fixture(); await f.service.send(user);
  for (let i = 0; i < 5; i++) await assert.rejects(f.service.verify(user, "111111"));
  assert.equal(f.row().attempts, 5);
  await assert.rejects(f.service.verify(user, "012345"), /Agotaste/);
  assert.equal(f.marked(), 0);
});
test("expiry, resend cooldown, new code invalidation and per-account hourly limits", async () => {
  const f = fixture(); await f.service.send(user);
  await assert.rejects(f.service.send(user), (e) => e.status === 429 && e.retryAfter === 60);
  f.advance(600000);
  await assert.rejects(f.service.verify(user, "012345"), /venció/);
  f.code("654321"); await f.service.send(user);
  await assert.rejects(f.service.verify(user, "012345"));
  for (let i = 0; i < 3; i++) { f.advance(60000); await f.service.send(user); }
  f.advance(60000); await assert.rejects(f.service.send(user), /límite/);
  assert.equal((await f.service.verify(user, "654321")).verified, true);
});
test("simultaneous confirmations consume code once", async () => {
  const f = fixture(); await f.service.send(user);
  const results = await Promise.allSettled([f.service.verify(user, "012345"), f.service.verify(user, "012345")]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(f.marked(), 1);
});
test("delivery failure and malformed input never grant verification", async () => {
  const f = fixture({ sendMail: async () => { throw new Error("delivery failed"); } });
  await assert.rejects(f.service.send(user), /delivery/);
  assert.equal(f.row(), undefined);
  for (const code of [123456, "12345", "1234567", "abcdef", null]) await assert.rejects(f.service.verify(user, code), /6 dígitos/);
  assert.equal(f.marked(), 0);
});
test("code is bound to account and email, not reusable for another identity", async () => {
  const f = fixture(); await f.service.send(user);
  await assert.rejects(f.service.verify({ ...user, email: "other@example.com" }, "012345"));
  await assert.rejects(f.service.verify({ ...user, id: 43 }, "012345"));
  assert.equal(f.marked(), 0);
});
