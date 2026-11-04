export const MAX_PASSWORD_BYTES = 72;

export function emailError(value) {
  const email = typeof value === "string" ? value.trim() : "";
  if (!email) return "Ingresá tu correo electrónico.";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Revisá el correo. Por ejemplo: nombre@correo.com.";
  }
  return "";
}

export function passwordRequirements(value = "") {
  return [
    { id: "length", label: "8 caracteres o más", met: value.length >= 8 },
    { id: "letter", label: "Al menos una letra", met: /[A-Za-z]/.test(value) },
    { id: "number", label: "Al menos un número", met: /\d/.test(value) },
  ];
}

export function passwordError(value = "") {
  if (!value) return "Creá una contraseña para tu cuenta.";
  if (new TextEncoder().encode(value).length > MAX_PASSWORD_BYTES) {
    return "La contraseña es demasiado larga. Acortala: los emojis y algunos símbolos ocupan más espacio.";
  }
  if (/[\r\n]/.test(value) || passwordRequirements(value).some((rule) => !rule.met)) {
    return "Usá al menos 8 caracteres, una letra y un número.";
  }
  return "";
}

export function confirmPasswordError(value, password) {
  if (!value) return "Repetí tu contraseña para confirmarla.";
  return value === password ? "" : "Las contraseñas no coinciden. Revisá ambas.";
}

export function fieldProps(id, error, hint) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  return { id, "aria-invalid": Boolean(error), "aria-describedby": describedBy || undefined };
}

// React needs to render the errors before we find their controls. Native focus
// alone can hide fields behind the navigation; center the field as well.
export function focusFirstError(form, errors = {}) {
  if (!form) return;
  requestAnimationFrame(() => {
    const invalidNames = Object.keys(errors).filter((name) => errors[name]);
    const control = [...form.querySelectorAll("input, textarea, select, button, [tabindex]")]
      .find((element) => !element.matches(":disabled") && element.type !== "hidden" && (
        invalidNames.includes(element.name) || invalidNames.includes(element.id) ||
        element.getAttribute("aria-invalid") === "true"
      ));
    if (!control) return;
    control.focus({ preventScroll: true });
    control.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
}

export function errorMessage(error, fallback = "No pudimos guardar los cambios. Intentá nuevamente.") {
  const data = error.response?.data;
  const message = typeof data === "string" ? data : data?.error || data?.message;
  const safeMessage = typeof message === "string" && message && !/BREVO_|RESEND_|SQL|Sequelize|Cannot |TypeError|<!doctype/i.test(message);
  if (error.response?.status === 429) return safeMessage && !/too many|rate limit/i.test(message) ? message : "Hiciste varios intentos seguidos. Esperá unos minutos y volvé a intentar.";
  if (error.response?.status === 503) return "El servidor se está iniciando. Esperá un momento y volvé a intentar.";
  if (!error.response && (error.request || error.code === "ERR_NETWORK")) return "No pudimos conectarnos. Revisá tu conexión y volvé a intentar.";
  if (/^missing credentials$/i.test(message || "")) return "Completá los campos obligatorios para continuar.";
  if (/^invalid email$/i.test(message || "")) return "Ingresá un correo electrónico válido.";
  if (!safeMessage) return fallback;
  return message;
}
