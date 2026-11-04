import { useEffect, useRef, useState } from "react";
import api from "../../api/api";
import { loginWithEmail } from "../../api/emailLogin.js";
import { Field, FormStatus } from "../forms/FormUI.jsx";
import { errorMessage, fieldProps, focusFirstError } from "../../utils/formValidation.js";
import styles from "./VerifyEmail.module.css";

const validateCode = (value) => /^\d{6}$/.test(value) ? "" : "Ingresá los 6 dígitos del código que recibiste por correo.";

export default function VerifyEmail({ credentials, sent = false, onClose, onVerified }) {
  const dialog = useRef(null);
  const form = useRef(null);
  const codeInput = useRef(null);
  const requestInFlight = useRef(false);
  const [hasSent, setHasSent] = useState(sent);
  const [code, setCode] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [action, setAction] = useState("");
  const [verified, setVerified] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [message, setMessage] = useState(sent ? "Te enviamos un código. Revisá también la carpeta de spam." : "Pedí un código para confirmar tu correo sin salir de Circula.");
  const [remaining, setRemaining] = useState(sent ? 60 : 0);

  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    codeInput.current?.focus();
    return () => node.close();
  }, []);
  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  async function enterAccount() {
    setAction("login");
    setAccessError("");
    try {
      const usuario = await loginWithEmail(credentials);
      onVerified(usuario);
    } catch {
      // The code has already been consumed. Retry only sign-in, never the OTP.
      setAccessError("Tu correo ya está confirmado, pero no pudimos iniciar sesión. Reintentá el acceso; no necesitás otro código.");
    }
  }
  async function confirm(event) {
    event.preventDefault();
    if (requestInFlight.current) return;
    const validation = validateCode(code);
    setTouched(true);
    setCodeError(validation);
    if (validation) { focusFirstError(form.current, { code: validation }); return; }
    requestInFlight.current = true;
    setBusy(true); setAction("confirm"); setRequestError("");
    try {
      await api.post("/users/confirm-verification", { ...credentials, code });
      setVerified(true);
      setCode("");
      await enterAccount();
    } catch (error) {
      const message = errorMessage(error, "No pudimos verificar el código. Intentá nuevamente.");
      if (/c[oó]digo|intentos|d[ií]gitos/i.test(message) && error.response?.status < 500) {
        setCodeError(message);
        focusFirstError(form.current, { code: message });
      } else setRequestError(message);
    } finally { requestInFlight.current = false; setBusy(false); setAction(""); }
  }
  async function retryAccess() {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy(true);
    try { await enterAccount(); }
    finally { requestInFlight.current = false; setBusy(false); setAction(""); }
  }
  async function resend() {
    if (requestInFlight.current || remaining > 0) return;
    requestInFlight.current = true;
    setBusy(true); setAction("send"); setRequestError("");
    try {
      const { data } = await api.post("/users/resend-verification", credentials);
      setHasSent(true);
      setCode(""); setTouched(false); setCodeError(""); setRemaining(data.retryAfter || 60);
      setMessage("Te enviamos un nuevo código. Usá el último correo recibido; el anterior ya no sirve.");
      requestAnimationFrame(() => codeInput.current?.focus());
    } catch (error) {
      setRequestError(errorMessage(error, "No pudimos enviar el correo. Intentá nuevamente más tarde."));
      if (error.response?.data?.retryAfter) setRemaining(error.response.data.retryAfter);
    } finally { requestInFlight.current = false; setBusy(false); setAction(""); }
  }

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="verify-title" aria-describedby="verify-description" aria-busy={busy} onCancel={(event) => { event.preventDefault(); if (!requestInFlight.current) onClose(); }}>
    <button type="button" className={styles.close} aria-label="Cerrar verificación" disabled={busy} onClick={onClose}>×</button>
    <div className={styles.symbol} aria-hidden="true">{verified ? "✓" : "@"}</div>
    <p className={styles.eyebrow}>UN ÚLTIMO PASO</p>
    <h2 id="verify-title">{verified ? "¡Correo confirmado!" : "Confirmá tu correo"}</h2>
    {verified ? <>
      <p id="verify-description" role="status">{busy ? "Estamos iniciando tu sesión…" : "Tu cuenta está lista para empezar a canjear."}</p>
      <FormStatus kind="error">{accessError}</FormStatus>
      {accessError && <button type="button" className={styles.primary} disabled={busy} onClick={retryAccess}>Reintentar acceso</button>}
    </> : <>
      <p id="verify-description">{hasSent ? "Ingresá el código de 6 dígitos enviado a" : "Vamos a enviar un código de 6 dígitos a"}<br /><strong className={styles.email}>{credentials.email}</strong></p>
      <p className={styles.notice} role="status">{message}</p>
      <form ref={form} onSubmit={confirm} noValidate>
        <Field id="verification-code" label="Código de verificación" required error={codeError} hint="Vence en 10 minutos. No tenés que abrir ningún enlace.">
          <input ref={codeInput} {...fieldProps("verification-code", codeError, true)} name="code" className={styles.code} type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => { const value = event.target.value.replace(/\D/g, "").slice(0, 6); setCode(value); if (touched) setCodeError(validateCode(value)); }} onBlur={() => { setTouched(true); setCodeError(validateCode(code)); }} placeholder="000000" disabled={busy} required />
        </Field>
        <FormStatus kind="error">{requestError}</FormStatus>
        <button className={styles.primary} type="submit" disabled={busy}>{action === "confirm" ? "Verificando código…" : action === "send" ? "Enviando código…" : "Verificar e ingresar"}</button>
      </form>
      <button type="button" className={styles.resend} disabled={busy || remaining > 0} onClick={resend}>{remaining > 0 ? `Reenviar en ${remaining} s` : hasSent ? "Enviar un nuevo código" : "Enviar código"}</button>
      <p className={styles.help}>Si cerrás esta ventana, podés continuar desde el inicio de sesión.</p>
    </>}
  </dialog>;
}
