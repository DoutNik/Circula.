const profileFields = (data = {}) => {
  const result = {};
  for (const field of ["username", "ubication", "image"]) {
    if (data[field] === undefined) continue;
    if (field === "image" && data[field] === null) {
      result.image = null;
      continue;
    }
    if (typeof data[field] !== "string") {
      throw Object.assign(new Error("Los datos del perfil no son válidos."), { status: 400 });
    }
    const value = data[field].trim();
    if (value.length > 255 || (field !== "image" && !value)) {
      throw Object.assign(new Error("Completá nombre y ubicación (máximo 255 caracteres)."), { status: 400 });
    }
    if (field === "image" && value) {
      try {
        if (new URL(value).protocol !== "https:") throw new Error();
      } catch {
        throw Object.assign(new Error("La foto debe tener una dirección HTTPS válida."), { status: 400 });
      }
    }
    result[field] = value;
  }
  return result;
};

module.exports = { profileFields };
