function validatePostFields(data = {}) {
  const fieldErrors = {};
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";
  const category = typeof data.category === "string" ? data.category.trim() : "";
  const ubication = typeof data.ubication === "string" ? data.ubication.trim() : "";
  if (title.length < 3 || title.length > 30) fieldErrors.title = "Escribí un título de entre 3 y 30 caracteres.";
  if ((data.description != null && typeof data.description !== "string") || description.length > 250) fieldErrors.description = "La descripción puede tener hasta 250 caracteres.";
  if (!category || category.length > 255) fieldErrors.category = "Seleccioná una categoría para tu producto.";
  if (!ubication || ubication.length > 255) fieldErrors.ubication = "Seleccioná la provincia y la localidad del producto.";
  const images = data.image;
  if (!Array.isArray(images) || images.length < 1 || images.length > 3 || images.some((url) => {
    if (typeof url !== "string" || url.length > 255) return true;
    try { return new URL(url).protocol !== "https:"; } catch { return true; }
  })) fieldErrors.images = "Agregá entre 1 y 3 fotos válidas para tu producto.";
  if (Object.keys(fieldErrors).length) {
    throw Object.assign(new Error("Revisá los campos indicados antes de publicar."), { fieldErrors });
  }
  return { title, description, category, ubication, image: images };
}
module.exports = { validatePostFields };
