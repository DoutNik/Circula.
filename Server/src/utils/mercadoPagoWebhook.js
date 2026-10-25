const crypto = require("crypto");

const WEBHOOK_TOLERANCE_SECONDS = 5 * 60;

const verifyMercadoPagoSignature = ({ headers = {}, query = {}, secret, now = Date.now() }) => {
  if (!secret) return false;

  const xSignature = headers["x-signature"];
  const xRequestId = headers["x-request-id"];
  const dataId = query["data.id"];
  if (!xSignature || !xRequestId || !dataId) return false;

  const fields = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    }),
  );
  const timestamp = Number(fields.ts);
  const signature = fields.v1;
  const nowInSeconds = Math.floor(now / 1000);

  if (
    !signature ||
    !Number.isFinite(timestamp) ||
    Math.abs(nowInSeconds - timestamp) > WEBHOOK_TOLERANCE_SECONDS
  ) {
    return false;
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${fields.ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  return expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};

module.exports = { verifyMercadoPagoSignature };
