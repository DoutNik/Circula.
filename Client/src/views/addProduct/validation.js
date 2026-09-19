export function validateTitle(title) {
  if (!title || title.trim() === "") {
    return "El título es obligatorio";
  }
  const value = title.trim();
  if (value.length < 3) {
    return "El título debe tener al menos 3 caracteres";
  }
  if (value.length > 30) {
    return "El título no debe superar los 30 caracteres";
  }
  return null;
}
export function validateDescription(description) {
  if (!description) {
    return null;
  }
  if (description.length > 250) {
    return "La descripción no puede superar los 250 caracteres";
  }
  return null;
}
/** * Valida una imagen real antes de subirla. * * Reglas: * - File válido * - PNG / JPG / JPEG * - máximo 5 MB * - MIME válido * - firma binaria válida * - el navegador debe poder decodificarla */ export async function validateImageFile(
  file,
) {
  if (!file) {
    return "Debes seleccionar una imagen";
  }
  if (!(file instanceof File)) {
    return "El archivo seleccionado no es válido";
  }
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size <= 0) {
    return "El archivo está vacío";
  }
  if (file.size > MAX_SIZE) {
    return "La imagen no puede superar los 5 MB";
  }
  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.type)) {
    return "Solo se permiten imágenes JPG, JPEG o PNG";
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!["jpg", "jpeg", "png"].includes(extension)) {
    return "Solo se permiten imágenes JPG, JPEG o PNG";
  }
  const validSignature = await validateImageSignature(file);
  if (!validSignature) {
    return "El contenido del archivo no corresponde a una imagen válida";
  }
  const validImage = await validateImageDecoding(file);
  if (!validImage) {
    return "La imagen está dañada o no puede ser procesada";
  }
  return null;
}
async function validateImageSignature(file) {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  // PNG
  const isPNG =
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  // JPEG
  const isJPEG =
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff;
  return isPNG || isJPEG;
}
function validateImageDecoding(file) {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image.width > 0 && image.height > 0);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(false);
    };
    image.src = objectUrl;
  });
}
