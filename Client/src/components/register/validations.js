/** * Valida un archivo de imagen real. * * Reglas: * - Debe ser File * - JPG/JPEG o PNG * - Máximo 5 MB * - Se verifica MIME * - Se verifica la firma binaria del archivo * - Se intenta decodificar como imagen */
export async function validateImageFile(file) {
  if (!file) {
    return "Debes seleccionar una imagen";
  }
  if (!(file instanceof File)) {
    return "El archivo seleccionado no es válido";
  }
  // Tamaño máximo: 5 MB
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size === 0) {
    return "El archivo está vacío";
  }
  if (file.size > MAX_SIZE) {
    return "La imagen no puede superar los 5 MB";
  }
  // Extensiones permitidas
  const allowedExtensions = ["jpg", "jpeg", "png"];
  const fileName = file.name.toLowerCase();
  const extension = fileName.includes(".") ? fileName.split(".").pop() : "";
  if (!allowedExtensions.includes(extension)) {
    return "Solo se permiten imágenes JPG, JPEG o PNG";
  }
  // MIME permitido
  const allowedMimeTypes = ["image/jpeg", "image/png"];
  if (!allowedMimeTypes.includes(file.type)) {
    return "El tipo de archivo no es una imagen JPG o PNG válida";
  }
  // Verificar firma binaria real del archivo
  const isRealImage = await validateImageSignature(file);
  if (!isRealImage) {
    return "El contenido del archivo no corresponde a una imagen JPG o PNG válida";
  }
  // Verificar que el navegador pueda abrir realmente la imagen
  const canBeDecoded = await validateImageCanBeDecoded(file);
  if (!canBeDecoded) {
    return "La imagen está dañada o no puede ser procesada";
  }
  return null;
}
/** * Comprueba los primeros bytes del archivo.
 * * * PNG: * 89 50 4E 47 0D 0A 1A 0A *
 * * JPEG: * FF D8 FF */
async function validateImageSignature(file) {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);
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
  const isJPEG =
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff;
  return isPNG || isJPEG;
}
/** * Comprueba que el navegador pueda decodificar * el archivo como una imagen. */ function validateImageCanBeDecoded(
  file,
) {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (image.width > 0 && image.height > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(false);
    };
    image.src = objectUrl;
  });
}

export function validateUsername(username) {
  if (!username || username.trim() === "") {
    return "Debes completar el campo";
  }
  const value = username.trim();
  if (value.length < 3) {
    return "El nombre de usuario debe tener al menos 3 caracteres";
  }
  if (value.length > 30) {
    return "El nombre de usuario no debe superar los 30 caracteres";
  }
  return null;
}
export function validateEmail(email) {
  if (!email || email.trim() === "") {
    return "Debes completar el campo";
  }
  const value = email.trim();
  /* Formato: usuario@dominio.ext */ const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(value)) {
    return "Ingrese una dirección de correo electrónico válida";
  }
  return null;
}
export function validatePassword(password) {
  if (!password || password === "") {
    return "Debes completar el campo";
  }
  if (password.length < 8 || password.length > 20) {
    return "La contraseña debe tener entre 8 y 20 caracteres";
  }
  /* Debe contener: - al menos una letra - al menos un número */ const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d).+$/;
  if (!passwordRegex.test(password)) {
    return "La contraseña debe incluir al menos una letra y un número";
  }
  return null;
}
export function validateImagen(image) {
  if (!image || image.trim() === "") {
    return "Debes completar el campo";
  }
  if (!isValidImageUrl(image)) {
    return "La URL de la imagen debe terminar en .png o .jpg";
  }
  return null;
}
function isValidImageUrl(url) {
  /* Acepta: foto.jpg foto.png https://dominio.com/foto.jpg https://dominio.com/foto.png?algo=123 */ const urlPattern =
    /\.(png|jpg)(?:[?#].*)?$/i;
  return urlPattern.test(url.trim());
}
export function validateProvince(province) {
  if (!province || province === "Elige una provincia") {
    return "Seleccione una provincia";
  }
  return null;
}
export function validateLocalidad(locality) {
  if (!locality || locality === "Elige una localidad") {
    return "Seleccione una localidad";
  }
  return null;
}
export const validatePasswordRepeat = (passwordRepeat, password) => {
  if (!passwordRepeat || passwordRepeat === "") {
    return "Debes completar el campo";
  }
  if (passwordRepeat !== password) {
    return "Las contraseñas no coinciden";
  }
  return null;
};
