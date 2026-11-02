const addressParser = require("nodemailer/lib/addressparser");

function createBrevoTransport({ apiKey, from, fetchImpl = fetch }) {
  const addresses = (value) => {
    if (!value) return undefined;
    const items = Array.isArray(value) ? value : [value];
    return items.flatMap((item) => typeof item === "string" ? addressParser(item) : [item])
      .map((item) => ({ email: item.address || item.email, ...(item.name ? { name: item.name } : {}) }));
  };
  return {
    async sendMail(mail) {
      if (!apiKey || !from) throw new Error("Configurar BREVO_API_KEY y MAIL_FROM para enviar correo por HTTPS");
      const sender = addresses(from)?.[0];
      if (!sender?.email) throw new Error("MAIL_FROM debe contener el remitente verificado en Brevo");
      const response = await fetchImpl("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          sender,
          to: addresses(mail.to), cc: addresses(mail.cc), bcc: addresses(mail.bcc),
          replyTo: addresses(mail.replyTo)?.[0],
          subject: mail.subject, htmlContent: mail.html, textContent: mail.text,
        }),
      });
      if (!response.ok) throw new Error(`Brevo rechazó el correo (HTTP ${response.status})`);
      const result = await response.json();
      if (!result.messageId) throw new Error("Brevo no devolvió un identificador de envío");
      return { messageId: result.messageId };
    },
  };
}
module.exports = { createBrevoTransport };
