import { useEffect, useRef, useState } from "react";
import api from "../../api/api.js";
import { Field, FormStatus } from "./FormUI.jsx";
import { errorMessage, fieldProps, focusFirstError } from "../../utils/formValidation.js";
import styles from "./FormUI.module.css";

export default function ReportDialog({ targetPostId, targetUserId, onClose }) {
  const dialog = useRef(null);
  const form = useRef(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const validate = (value) => value.trim().length < 3 ? "Contanos qué ocurrió con al menos 3 caracteres." : value.trim().length > 1000 ? "Resumí el motivo en hasta 1000 caracteres." : "";
  useEffect(() => {
    const previous = document.activeElement;
    const node = dialog.current;
    node.showModal();
    return () => { node.close(); previous?.focus(); };
  }, []);
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const validation = validate(reason);
    setError(validation); setServerError("");
    if (validation) { focusFirstError(form.current, { reason: validation }); return; }
    setBusy(true);
    try {
      await api.post("/reports", { ...(targetPostId ? { targetPostId } : { targetUserId }), reason: reason.trim() });
      setSent(true);
    } catch (err) { setServerError(errorMessage(err, "No pudimos enviar la denuncia. El texto sigue guardado para que reintentes.")); }
    finally { setBusy(false); }
  }
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="report-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    <button type="button" className={styles.close} aria-label="Cerrar denuncia" onClick={onClose} disabled={busy}>×</button>
    <p className={styles.eyebrow}>Cuidemos la comunidad</p>
    <h2 id="report-title" className={styles.dialogTitle}>{sent ? "Recibimos tu denuncia" : targetPostId ? "Denunciar publicación" : "Denunciar perfil"}</h2>
    {sent ? <><FormStatus kind="success">Gracias por avisarnos. El equipo de moderación revisará lo ocurrido.</FormStatus><button type="button" className={styles.primary} onClick={onClose}>Entendido</button></> : <>
      <p className={styles.sectionDescription}>Contanos qué encontraste para que podamos revisarlo. Evitá incluir contraseñas u otros datos privados.</p>
      <form ref={form} onSubmit={submit} noValidate aria-busy={busy}>
        <Field id="report-reason" label="Motivo de la denuncia" required hint={`${reason.length}/1000 caracteres`} error={error}>
          <textarea {...fieldProps("report-reason", error, true)} name="reason" className={styles.control} value={reason} placeholder="Por ejemplo: la publicación contiene información engañosa…" onChange={(event) => { setReason(event.target.value); if (error) setError(validate(event.target.value)); }} onBlur={() => setError(validate(reason))} disabled={busy} required maxLength={1000} />
        </Field>
        <FormStatus kind="error">{serverError}</FormStatus>
        <div className={styles.actions}><button type="submit" className={styles.primary} disabled={busy}>{busy ? "Enviando denuncia…" : "Enviar denuncia"}</button><button type="button" className={styles.secondary} disabled={busy} onClick={onClose}>Cancelar</button></div>
      </form>
    </>}
  </dialog>;
}
