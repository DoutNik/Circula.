function createResendTransport({ apiKey, from, fetchImpl = fetch }) {
  return {
    async sendMail(mail) {
      if (!apiKey || !from) {
        throw new Error("Configurar RESEND_API_KEY y MAIL_FROM para enviar correo por HTTPS");
      }
      const addresses = (value) => value ? (Array.isArray(value) ? value : [value]) : undefined;
      const response = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          from: mail.from || from,
          to: addresses(mail.to),
          cc: addresses(mail.cc),
          bcc: addresses(mail.bcc),
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          reply_to: mail.replyTo,
        }),
      });
      if (!response.ok) throw new Error(`Resend rechazó el correo (HTTP ${response.status})`);
      const result = await response.json();
      if (!result.id) throw new Error("Resend no devolvió un identificador de envío");
      return { messageId: result.id };
    },
  };
}

module.exports = { createResendTransport };
