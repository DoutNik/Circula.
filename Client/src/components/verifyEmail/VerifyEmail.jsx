import { useEffect, useRef, useState } from "react";
import api from "../../api/api";
import styles from "./VerifyEmail.module.css";

export default function VerifyEmail({ credentials, sent = false, onClose, onVerified }) {
  const dialog = useRef(null);
  const codeInput = useRef(null);
  const [hasSent, setHasSent] = useState(sent);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
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
  async function confirm(event) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) { setError("Ingresá los 6 dígitos del correo."); return; }
    setBusy(true); setError("");
    try {
      await api.post("/users/confirm-verification", { ...credentials, code });
      setVerified(true);
    } catch (err) { setError(err.response?.data?.error || "No pudimos verificar el código. Intentá nuevamente."); }
    finally { setBusy(false); }
  }
  async function resend() {
    setBusy(true); setError("");
    try {
      const { data } = await api.post("/users/resend-verification", credentials);
      setHasSent(true);
      setCode(""); setRemaining(data.retryAfter || 60);
      setMessage("Te enviamos un nuevo código. Usá el último correo recibido; el anterior ya no sirve.");
    } catch (err) {
      setError(err.response?.data?.error || "No pudimos enviar el correo. Intentá nuevamente más tarde.");
      if (err.response?.data?.retryAfter) setRemaining(err.response.data.retryAfter);
    } finally { setBusy(false); }
  }
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="verify-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    <button type="button" className={styles.close} aria-label="Cerrar verificación" disabled={busy} onClick={onClose}>×</button>
    <div className={styles.symbol} aria-hidden="true">{verified ? "✓" : "@"}</div>
    <h2 id="verify-title">{verified ? "¡Correo confirmado!" : "Confirmá tu correo"}</h2>
    {verified ? <><p>Tu cuenta está lista. Ya podés ingresar y empezar a canjear.</p><button className={styles.primary} onClick={onVerified}>Ir a iniciar sesión</button></> : <>
      <p>{hasSent ? "Ingresá el código de 6 dígitos enviado a" : "Vamos a enviar un código de 6 dígitos a"}<br /><strong className={styles.email}>{credentials.email}</strong></p>
      <p className={styles.notice} role="status">{message}</p>
      <form onSubmit={confirm}>
        <label htmlFor="verification-code">Código de verificación</label>
        <input ref={codeInput} id="verification-code" className={styles.code} type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} placeholder="000000" aria-describedby="code-help" aria-invalid={Boolean(error)} disabled={busy} />
        <p id="code-help" className={styles.help}>Vence en 10 minutos. No tenés que abrir ningún enlace.</p>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <button className={styles.primary} disabled={busy || code.length !== 6}>{busy ? "Procesando…" : "Verificar cuenta"}</button>
      </form>
      <button type="button" className={styles.resend} disabled={busy || remaining > 0} onClick={resend}>{remaining > 0 ? `Reenviar en ${remaining} s` : hasSent ? "Enviar un nuevo código" : "Enviar código"}</button>
      <p className={styles.help}>Podés cerrar esta ventana y verificar después desde el inicio de sesión.</p>
    </>}
  </dialog>;
}
