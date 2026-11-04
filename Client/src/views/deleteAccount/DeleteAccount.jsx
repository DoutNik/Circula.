import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import { Field, FormPage, FormStatus } from "../../components/forms/FormUI.jsx";
import forms from "../../components/forms/FormUI.module.css";
import { emailError, errorMessage, fieldProps, focusFirstError } from "../../utils/formValidation.js";
import styles from "./DeleteAccount.module.css";

export default function DeleteAccount() {
  const [searchParams] = useSearchParams();
  const form = useRef(null);
  const submitting = useRef(false);
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [touched, setTouched] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [deleted, setDeleted] = useState(false);
  const [busy, setBusy] = useState(false);
  const deletionToken = searchParams.get("token");

  async function requestDeletion(event) {
    event.preventDefault();
    if (submitting.current) return;
    const validation = emailError(email);
    setTouched(true); setFieldError(validation);
    if (validation) { focusFirstError(form.current, { email: validation }); return; }
    submitting.current = true;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await api.post("/users/request-account-deletion", { email: email.trim().toLowerCase() });
      setMessage(response.data.message);
    } catch (requestError) {
      setError(errorMessage(requestError, "No pudimos enviar el enlace. Intentá nuevamente en unos minutos."));
    } finally { submitting.current = false; setBusy(false); }
  }

  async function confirmDeletion(event) {
    event.preventDefault();
    if (submitting.current || deleted) return;
    if (!confirmed) {
      const validation = "Confirmá que entendés que la eliminación es definitiva.";
      setConfirmError(validation);
      focusFirstError(form.current, { confirmation: validation });
      return;
    }
    submitting.current = true;
    setBusy(true); setError("");
    try {
      const response = await api.delete("/users/delete-by-token", { data: { token: deletionToken } });
      setMessage(response.data.message);
      setDeleted(true);
    } catch (requestError) {
      setError(errorMessage(requestError, "No pudimos eliminar la cuenta. Si el enlace venció, solicitá uno nuevo."));
    } finally { submitting.current = false; setBusy(false); }
  }

  return <FormPage eyebrow="TU CUENTA" title={deleted ? "Tu cuenta fue eliminada" : "Eliminar mi cuenta"} description={deleted ? "La eliminación se completó." : "Antes de continuar, revisá qué datos se eliminarán."}>
    {!deleted && <div className={styles.warning}>
      <h2>Esta acción es permanente</h2>
      <p>Se eliminarán tu perfil, publicaciones, mensajes, solicitudes de canje y reseñas. No podrás recuperarlos.</p>
    </div>}
    {deleted ? <FormStatus kind="success">{message}</FormStatus> : deletionToken ? <form ref={form} onSubmit={confirmDeletion} noValidate aria-busy={busy}>
      <p className={forms.help}>El enlace de confirmación vence en 30 minutos.</p>
      <label className={`${styles.confirmation} ${confirmError ? styles.invalid : ""}`}>
        <input name="confirmation" type="checkbox" checked={confirmed} onChange={(event) => { setConfirmed(event.target.checked); setConfirmError(""); }} aria-invalid={Boolean(confirmError)} aria-describedby={confirmError ? "deletion-confirmation-error" : undefined} disabled={busy} />
        <span>Entiendo que mi cuenta y mis datos se eliminarán definitivamente.</span>
      </label>
      {confirmError && <p id="deletion-confirmation-error" role="alert" className={styles.error}>{confirmError}</p>}
      <FormStatus kind="error">{error}</FormStatus>
      <div className={forms.actions}><Link className={forms.secondary} to="/">Conservar mi cuenta</Link><button type="submit" className={styles.danger} disabled={busy}>{busy ? "Eliminando cuenta…" : "Eliminar definitivamente"}</button></div>
    </form> : <form ref={form} onSubmit={requestDeletion} noValidate aria-busy={busy}>
      <Field id="deletion-email" label="Correo de tu cuenta" required hint="Te enviaremos un enlace para confirmar la eliminación. Revisá también la carpeta de spam." error={fieldError}>
        <input {...fieldProps("deletion-email", fieldError, true)} className={forms.control} name="email" type="email" inputMode="email" autoCapitalize="none" spellCheck={false} value={email} onChange={(event) => { setEmail(event.target.value); if (touched) setFieldError(emailError(event.target.value)); setError(""); setMessage(""); }} onBlur={() => { setTouched(true); setFieldError(emailError(email)); }} placeholder="vos@ejemplo.com" autoComplete="email" disabled={busy} required />
      </Field>
      <FormStatus kind="success">{message}</FormStatus>
      <FormStatus kind="error">{error}</FormStatus>
      <div className={forms.actions}><button type="submit" className={forms.primary} disabled={busy}>{busy ? "Enviando enlace…" : "Enviar enlace de confirmación"}</button></div>
    </form>}
    <p className={styles.back}><Link to="/login">Volver al inicio de sesión</Link></p>
  </FormPage>;
}
