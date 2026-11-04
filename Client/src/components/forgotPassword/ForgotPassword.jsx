import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import { FormPage, Field, FormStatus } from "../forms/FormUI.jsx";
import styles from "../forms/FormUI.module.css";
import { emailError, fieldProps, focusFirstError, errorMessage } from "../../utils/formValidation.js";

export default function ForgotPassword() {
  const form = useRef(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState("");
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setTouched(true); setStatus("");
    const issue = emailError(email); setError(issue);
    if (issue) { focusFirstError(form.current, { email: issue }); return; }
    setBusy(true);
    try { await api.post("/users/forgot-password", { email: email.trim().toLowerCase() }); setSent(true); }
    catch (err) { setStatus(errorMessage(err, "No pudimos procesar la solicitud. Revisá tu conexión e intentá otra vez.")); }
    finally { setBusy(false); }
  }
  return <FormPage eyebrow="RECUPERÁ TU ACCESO" title={sent ? "Revisá tu correo" : "¿Olvidaste tu contraseña?"} description={sent ? "Si hay una cuenta asociada a ese correo, vas a recibir un enlace para elegir una nueva contraseña." : "Ingresá el correo de tu cuenta y te enviaremos un enlace para elegir una nueva contraseña."}>
    {sent ? <>
      <FormStatus kind="success">Solicitud recibida. Revisá tu bandeja de entrada y la carpeta de spam. El enlace vence en 30 minutos.</FormStatus>
      <div className={styles.actions}><Link className={styles.primary} to="/login">Volver al inicio de sesión</Link><button className={styles.subtle} type="button" onClick={() => { setSent(false); setStatus(""); }}>Usar otro correo o volver a solicitarlo</button></div>
    </> : <form ref={form} onSubmit={submit} noValidate aria-busy={busy}>
      <Field id="forgot-email" label="Correo electrónico" required hint="Usá el mismo correo con el que creaste tu cuenta." error={error}>
        <input {...fieldProps("forgot-email", error, true)} className={styles.control} name="email" type="email" inputMode="email" placeholder="vos@ejemplo.com" autoComplete="email" autoCapitalize="none" spellCheck={false} value={email} onChange={(event) => { const value = event.target.value; setEmail(value); setStatus(""); if (touched) setError(emailError(value)); }} onBlur={() => { setTouched(true); setError(emailError(email)); }} disabled={busy} required />
      </Field>
      {status && <FormStatus kind="error">{status}</FormStatus>}
      <div className={styles.actions}><button className={styles.primary} type="submit" disabled={busy}>{busy ? "Enviando solicitud…" : "Enviar enlace de recuperación"}</button><Link className={styles.subtle} to="/login">Volver al inicio de sesión</Link></div>
    </form>}
  </FormPage>;
}
