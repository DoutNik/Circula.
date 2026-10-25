const test = require("node:test");
const assert = require("node:assert/strict");
const { assertAllowedText } = require("../src/utils/contentModeration");

test("permite una descripción normal de un producto", () => {
  assert.doesNotThrow(() => assertAllowedText("Bicicleta usada", "Funciona bien y se entrega en Buenos Aires"));
});

test("bloquea términos de alto riesgo antes de guardar contenido", () => {
  assert.throws(
    () => assertAllowedText("Oferta", "Incluye armas de fuego"),
    /no está permitido/i,
  );
});
