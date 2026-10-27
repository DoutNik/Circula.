const test = require("node:test");
const assert = require("node:assert/strict");
const { createResendTransport } = require("../src/config/resendTransport");

test("correo HTTPS conserva destinatarios ocultos y devuelve el identificador", async () => {
  let request;
  const transport = createResendTransport({
    apiKey: "test-key", from: "Circula <test@example.invalid>",
    fetchImpl: async (url, options) => {
      request = { url, ...options };
      return { ok: true, json: async () => ({ id: "test-id" }) };
    },
  });
  const result = await transport.sendMail({ to: "one@example.invalid", bcc: "two@example.invalid", subject: "Test", html: "<p>Test</p>" });
  assert.equal(request.url, "https://api.resend.com/emails");
  assert.deepEqual(JSON.parse(request.body).bcc, ["two@example.invalid"]);
  assert.deepEqual(JSON.parse(request.body).to, ["one@example.invalid"]);
  assert.equal(result.messageId, "test-id");
});

test("correo no simula éxito sin credenciales o cuando el proveedor rechaza el envío", async () => {
  const missing = createResendTransport({});
  await assert.rejects(missing.sendMail({}), /RESEND_API_KEY/);
  const rejected = createResendTransport({ apiKey: "test", from: "test@example.invalid", fetchImpl: async () => ({ ok: false, status: 403 }) });
  await assert.rejects(rejected.sendMail({}), /HTTP 403/);
});
