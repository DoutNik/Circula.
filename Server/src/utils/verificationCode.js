const { randomInt, randomBytes, createHmac, timingSafeEqual } = require("node:crypto");
const TTL = 10 * 60 * 1000;
const COOLDOWN = 60 * 1000;
const HOUR = 60 * 60 * 1000;
const failure = (message, status = 400, retryAfter) => ({ error: { message, status, retryAfter } });

// withLock serializes sends and attempts for one account across all API instances.
function createVerificationCode({ withLock, sendMail, markVerified, secret, now = Date.now, generateCode = () => String(randomInt(0, 1000000)).padStart(6, "0") }) {
  const hash = (user, nonce, code) => {
    if (!secret) throw new Error("Falta configurar la clave del servidor.");
    return createHmac("sha256", secret).update(JSON.stringify([user.id, user.email.toLowerCase(), nonce, code])).digest("hex");
  };
  const unwrap = (result) => {
    if (result.error) throw Object.assign(new Error(result.error.message), result.error);
    return result;
  };
  async function send(user) {
    return unwrap(await withLock(user, async (row, save) => {
      const time = now();
      const inWindow = row && time - +new Date(row.windowStart) < HOUR;
      if (row && time - +new Date(row.sentAt) < COOLDOWN) {
        const retry = Math.ceil((COOLDOWN - (time - +new Date(row.sentAt))) / 1000);
        return failure(`Esperá ${retry} segundos antes de pedir otro código.`, 429, retry);
      }
      if (inWindow && row.sendCount >= 5) return failure("Alcanzaste el límite de envíos. Intentá nuevamente en una hora.", 429);
      const code = generateCode();
      const nonce = randomBytes(16).toString("hex");
      const codeHash = hash(user, nonce, code);
      await sendMail({
        to: user.email,
        subject: "Tu código para verificar Circula",
        text: `Tu código de verificación de Circula es: ${code}\n\nIngresalo en la ventana de Circula donde te registraste. Vence en 10 minutos y solo se puede usar una vez. No lo compartas. Si no lo pediste, ignorá este correo.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;color:#243127"><h1 style="font-size:24px">Confirmá tu correo</h1><p>Ingresá este código en Circula:</p><p style="font-size:36px;font-weight:bold;letter-spacing:8px;background:#fff6ce;padding:20px;text-align:center;border-radius:12px">${code}</p><p>Vence en 10 minutos y solo se puede usar una vez.</p><p>No lo compartas. Si no lo pediste, ignorá este correo.</p></div>`,
      });
      await save({ codeHash, nonce, expiresAt: new Date(time + TTL), sentAt: new Date(time), windowStart: inWindow ? row.windowStart : new Date(time), sendCount: inWindow ? row.sendCount + 1 : 1, attempts: 0, usedAt: null });
      return { verificationSent: true, expiresIn: 600, retryAfter: 60 };
    }));
  }
  async function verify(user, code) {
    if (typeof code !== "string" || !/^\d{6}$/.test(code)) throw Object.assign(new Error("Ingresá los 6 dígitos del código."), { status: 400 });
    return unwrap(await withLock(user, async (row, save) => {
      const time = now();
      if (!row || row.usedAt || +new Date(row.expiresAt) <= time) return failure("El código venció o ya fue utilizado. Pedí uno nuevo.");
      if (row.attempts >= 5) return failure("Agotaste los intentos. Pedí un código nuevo.", 429);
      const matches = timingSafeEqual(Buffer.from(hash(user, row.nonce, code), "hex"), Buffer.from(row.codeHash, "hex"));
      if (!matches) {
        await save({ ...row, attempts: row.attempts + 1 });
        return failure(row.attempts + 1 >= 5 ? "Agotaste los intentos. Pedí un código nuevo." : "El código no coincide. Revisá los 6 dígitos e intentá nuevamente.");
      }
      await markVerified(user);
      await save({ ...row, usedAt: new Date(time) });
      return { verified: true, message: "Correo confirmado. Ya podés iniciar sesión." };
    }));
  }
  return { send, verify };
}
module.exports = { createVerificationCode };
