const test = require("node:test");
const assert = require("node:assert/strict");
const { createBrevoTransport } = require("../src/config/brevoTransport");

test("Brevo sends code by HTTPS with verified sender and preserves private recipients", async () => {
  let request;
  const transport = createBrevoTransport({ apiKey: "test-secret", from: '"Circula" <sender@example.com>', fetchImpl: async (url, options) => {
    request = { url, ...options }; return { ok: true, json: async () => ({ messageId: "sent-id" }) };
  } });
  assert.deepEqual(await transport.sendMail({ from: "unverified@example.com", to: "Ana <ana@example.com>", bcc: ["hidden@example.com"], replyTo: "help@example.com", subject: "Código", text: "012345", html: "<p>012345</p>" }), { messageId: "sent-id" });
  const body = JSON.parse(request.body);
  assert.equal(request.url, "https://api.brevo.com/v3/smtp/email");
  assert.equal(request.headers["api-key"], "test-secret");
  assert.deepEqual(body.sender, { email: "sender@example.com", name: "Circula" });
  assert.deepEqual(body.to, [{ email: "ana@example.com", name: "Ana" }]);
  assert.deepEqual(body.bcc, [{ email: "hidden@example.com" }]);
  assert.equal(body.textContent, "012345");
  assert.deepEqual(body.replyTo, { email: "help@example.com" });
});

test("Brevo fails honestly for missing credentials, rejection and incomplete response", async () => {
  await assert.rejects(createBrevoTransport({}).sendMail({}), /BREVO_API_KEY/);
  for (const response of [{ ok: false, status: 403 }, { ok: true, json: async () => ({}) }]) {
    const transport = createBrevoTransport({ apiKey: "test", from: "sender@example.com", fetchImpl: async () => response });
    await assert.rejects(transport.sendMail({ to: "a@example.com" }), /Brevo/);
  }
});
