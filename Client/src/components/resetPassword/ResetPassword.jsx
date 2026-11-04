import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import { FormPage, Field, PasswordInput, PasswordChecklist, FormStatus } from "../forms/FormUI.jsx";
import styles from "../forms/FormUI.module.css";
import { fieldProps, focusFirstError, passwordError, confirmPasswordError, errorMessage } from "../../utils/formValidation.js";

const validate = (values) => ({ password: passwordError(values.password), passwordRepeat: confirmPasswordError(values.passwordRepeat, values.password) });

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const form = useRef(null);
  const [values, setValues] = useState({ password: "", passwordRepeat: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState("");
  function change(event) {
    const { name, value } = event.target; const next = { ...values, [name]: value };
    setValues(next); setStatus("");
    const invalid = validate(next);
    setErrors((previous) => ({ ...previous, [name]: touched[name] || submitted ? invalid[name] : "", ...(name === "password" && (touched.passwordRepeat || submitted) ? { passwordRepeat: invalid.passwordRepeat } : {}) }));
  }
  function blur(event) {
    const { name } = event.target;
    setTouched((previous) => ({ ...previous, [name]: true }));
    setErrors((previous) => ({ ...previous, [name]: validate(values)[name] }));
  }
  async function submit(event) {
    event.preventDefault(); if (busy || !token) return;
    setSubmitted(true); setStatus("");
    const invalid = validate(values); setErrors(invalid);
    if (Object.values(invalid).some(Boolean)) { focusFirstError(form.current, invalid); return; }
    setBusy(true);
    try { await api.post("/users/reset-password", { password: values.password, token }); setValues({ password: "", passwordRepeat: "" }); setDone(true); }
    catch (err) { setStatus(errorMessage(err, "No pudimos guardar la contraseña. Revisá tu conexión e intentá nuevamente.")); }
    finally { setBusy(false); }
  }
  return <FormPage eyebrow="TU CUENTA, PROTEGIDA" title={done ? "Contraseña actualizada" : "Elegí una nueva contraseña"} description={done ? "Ya podés volver a Circula con tu nueva contraseña." : "Creá una contraseña que no uses en otros sitios y repetila para confirmar."}>
    {!token ? <><FormStatus kind="error">Este enlace está incompleto. Solicitá uno nuevo para recuperar tu cuenta.</FormStatus><Link className={styles.primary} to="/forgotpassword">Solicitar un nuevo enlace</Link></> : done ? <><FormStatus kind="success">Guardamos tu nueva contraseña.</FormStatus><div className={styles.actions}><Link className={styles.primary} to="/login">Iniciar sesión</Link></div></> : <form ref={form} onSubmit={submit} noValidate aria-busy={busy}>
      <Field id="reset-password" label="Nueva contraseña" required error={errors.password}>
        <PasswordInput {...fieldProps("reset-password", errors.password)} className={styles.control} name="password" placeholder="Creá una contraseña segura" autoComplete="new-password" value={values.password} onChange={change} onBlur={blur} disabled={busy} required />
      </Field>
      <PasswordChecklist value={values.password} />
      <Field id="reset-passwordRepeat" label="Repetí la nueva contraseña" required error={errors.passwordRepeat}>
        <PasswordInput {...fieldProps("reset-passwordRepeat", errors.passwordRepeat)} className={styles.control} name="passwordRepeat" placeholder="Volvé a escribir tu contraseña" autoComplete="new-password" value={values.passwordRepeat} onChange={change} onBlur={blur} disabled={busy} required />
      </Field>
      {status && <FormStatus kind="error">{status}</FormStatus>}
      <div className={styles.actions}><button className={styles.primary} type="submit" disabled={busy}>{busy ? "Guardando contraseña…" : "Guardar nueva contraseña"}</button><Link className={styles.subtle} to="/forgotpassword">¿El enlace venció? Pedí uno nuevo</Link></div>
    </form>}
  </FormPage>;
}
