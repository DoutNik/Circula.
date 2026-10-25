// Filtro preventivo mínimo para contenido de alto riesgo. No reemplaza la
// revisión humana: la app también ofrece denuncia, bloqueo y una cola admin.
// Se puede ampliar en producción con MODERATION_BLOCKED_TERMS separado por
// comas, sin tener que publicar otra versión.
const defaultBlockedTerms = [
  "pornografía infantil",
  "pornografia infantil",
  "csam",
  "material de abuso sexual infantil",
  "cocaína",
  "cocaina",
  "heroína",
  "heroina",
  "armas de fuego",
  "explosivos",
];

const configuredTerms = (process.env.MODERATION_BLOCKED_TERMS || "")
  .split(",")
  .map((term) => term.trim().toLocaleLowerCase("es-AR"))
  .filter(Boolean);

const blockedTerms = [...new Set([...defaultBlockedTerms, ...configuredTerms])];

const assertAllowedText = (...values) => {
  const combined = values
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLocaleLowerCase("es-AR");
  const matchedTerm = blockedTerms.find((term) => combined.includes(term));
  if (matchedTerm) {
    const error = new Error("El contenido incluye material que no está permitido en Circula.");
    error.statusCode = 400;
    throw error;
  }
};

module.exports = { assertAllowedText };
