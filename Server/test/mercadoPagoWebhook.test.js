const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { verifyMercadoPagoSignature } = require("../src/utils/mercadoPagoWebhook");

const secret = "test-webhook-secret";
const now = 1_700_000_000_000;
const timestamp = String(Math.floor(now / 1000));
const requestId = "request-123";
const paymentId = "456";
const manifest = `id:${paymentId};request-id:${requestId};ts:${timestamp};`;
const validHash = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

test("acepta una firma de Mercado Pago válida y reciente", () => {
  assert.equal(
    verifyMercadoPagoSignature({
      headers: { "x-signature": `ts=${timestamp},v1=${validHash}`, "x-request-id": requestId },
      query: { "data.id": paymentId },
      secret,
      now,
    }),
    true,
  );
});

test("rechaza una firma alterada o vencida", () => {
  assert.equal(
    verifyMercadoPagoSignature({
      headers: { "x-signature": `ts=${timestamp},v1=${"0".repeat(64)}`, "x-request-id": requestId },
      query: { "data.id": paymentId },
      secret,
      now,
    }),
    false,
  );
  assert.equal(
    verifyMercadoPagoSignature({
      headers: { "x-signature": `ts=${timestamp},v1=${validHash}`, "x-request-id": requestId },
      query: { "data.id": paymentId },
      secret,
      now: now + 6 * 60 * 1000,
    }),
    false,
  );
});
