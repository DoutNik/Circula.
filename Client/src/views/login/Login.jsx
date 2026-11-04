import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase.js";
import api from "../../api/api.js";
import { loginWithEmail } from "../../api/emailLogin.js";
import { retryLogin, serverUnavailableMessage } from "../../api/retryLogin.js";
import VerifyEmail from "../../components/verifyEmail/VerifyEmail";
import { FormPage, Field, PasswordInput, FormStatus } from "../../components/forms/FormUI.jsx";
import styles from "../../components/forms/FormUI.module.css";
import local from "./Login.module.css";
import { emailError, fieldProps, focusFirstError, errorMessage } from "../../utils/formValidation.js";

const validate = (values) => ({ email: emailError(values.email), password: values.password ? "" : "Ingresá tu contraseña." });

export default function Login({ setAuth }) {
  const navigate = useNavigate();
  const form = useRef(null);
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [busy, setBusy] = useState("");
  const [waitingForServer, setWaitingForServer] = useState(false);
  const [status, setStatus] = useState("");

  function change(event) {
    const { name, value } = event.target;
    const next = { ...values, [name]: value };
    setValues(next); setStatus("");
    setErrors((previous) => ({ ...previous, [name]: touched[name] || submitted ? validate(next)[name] : "" }));
  }
  function blur(event) {
    const { name } = event.target;
    setTouched((previous) => ({ ...previous, [name]: true }));
    setErrors((previous) => ({ ...previous, [name]: validate(values)[name] }));
  }
  function validForm() {
    const invalid = validate(values); setErrors(invalid); setSubmitted(true);
    if (Object.values(invalid).some(Boolean)) { focusFirstError(form.current, invalid); return false; }
    return true;
  }
  function enter(usuario) {
    setVerificationNeeded(false); setValues({ email: "", password: "" });
    setAuth(true, usuario); navigate("/profile", { replace: true });
  }
  async function submit(event) {
    event.preventDefault();
    if (busy || !validForm()) return;
    setBusy("email"); setStatus("");
    try { enter(await loginWithEmail(values, { onWaiting: () => setWaitingForServer(true) })); }
    catch (error) {
      if (error.response?.data?.code === "EMAIL_NOT_VERIFIED") { setVerificationNeeded(true); return; }
      const message = error.response?.status === 503 ? serverUnavailableMessage : errorMessage(error, "No pudimos iniciar sesión. Revisá tu conexión y volvé a intentarlo.");
      const field = /contraseña.*incorrect|ingresá tu contraseña/i.test(message) ? "password" : /no hay una cuenta|correo.*válido/i.test(message) ? "email" : null;
      if (field) { setErrors((previous) => ({ ...previous, [field]: message })); focusFirstError(form.current, { [field]: message }); }
      else setStatus(message);
    } finally { setBusy(""); setWaitingForServer(false); }
  }
  function openVerification() {
    if (!busy && validForm()) { setStatus(""); setVerificationNeeded(true); }
  }
  async function googleLogin() {
    if (busy) return;
    setBusy("google"); setStatus(""); setErrors({});
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await result.user.getIdToken();
      const { data } = await retryLogin(() => api.post("/users/social-login", { idToken }), { onWaiting: () => setWaitingForServer(true) });
      if (!data.token || !data.usuario) throw new Error();
      localStorage.setItem("token", data.token); enter(data.usuario);
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") return;
      setStatus(error.code === "auth/account-exists-with-different-credential" ? "Ese correo ya tiene una cuenta con otro método de acceso. Ingresá con el método que usaste al registrarte." : error.code === "auth/popup-blocked" ? "El navegador bloqueó la ventana de Google. Permití las ventanas emergentes para Circula y volvé a intentarlo." : error.response?.status === 503 ? serverUnavailableMessage : "No pudimos conectar con Google. Revisá tu conexión e intentá otra vez.");
    } finally { setBusy(""); setWaitingForServer(false); }
  }

  return <FormPage eyebrow="QUÉ BUENO VERTE" title="Iniciá sesión" description="Entrá a tu cuenta para publicar, conversar y encontrar tu próximo canje.">
    {verificationNeeded && <VerifyEmail credentials={{ email: values.email.trim(), password: values.password }} onClose={() => setVerificationNeeded(false)} onVerified={enter} />}
    <button className={`${styles.secondary} ${local.google}`} type="button" onClick={googleLogin} disabled={Boolean(busy)}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a6 6 0 0 1-5.7-4.2H3v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.3 13.9a6 6 0 0 1 0-3.8V7.5H3a10 10 0 0 0 0 9l3.3-2.6Z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9 5.5l3.3 2.6A6 6 0 0 1 12 5.9Z"/></svg>{busy === "google" ? "Conectando con Google…" : "Continuar con Google"}</button>
    <div className={local.divider}><span>o usá tu correo</span></div>
    <form ref={form} onSubmit={submit} noValidate aria-busy={Boolean(busy)}>
      <Field id="login-email" label="Correo electrónico" required error={errors.email}>
        <input {...fieldProps("login-email", errors.email)} className={styles.control} name="email" type="email" inputMode="email" placeholder="vos@ejemplo.com" autoComplete="username" autoCapitalize="none" spellCheck={false} value={values.email} onChange={change} onBlur={blur} disabled={Boolean(busy)} required />
      </Field>
      <Field id="login-password" label="Contraseña" required error={errors.password}>
        <PasswordInput {...fieldProps("login-password", errors.password)} className={styles.control} name="password" placeholder="Ingresá tu contraseña" autoComplete="current-password" value={values.password} onChange={change} onBlur={blur} disabled={Boolean(busy)} required />
      </Field>
      <div className={local.recover}><Link className={styles.subtle} to="/forgotpassword">Olvidé mi contraseña</Link></div>
      {status && <FormStatus kind="error">{status}</FormStatus>}
      {waitingForServer && <FormStatus kind="info">Estamos preparando el acceso. Puede demorar unos segundos; no hace falta volver a enviar.</FormStatus>}
      <div className={styles.actions}><button type="submit" className={styles.primary} disabled={Boolean(busy)}>{busy === "email" ? "Iniciando sesión…" : "Iniciar sesión"}</button></div>
    </form>
    <div className={local.verification}><strong>¿Te falta verificar el correo?</strong><p>Completá tu correo y contraseña arriba. Te ayudamos a confirmar tu cuenta sin salir de Circula.</p><button type="button" className={styles.subtle} onClick={openVerification} disabled={Boolean(busy)}>Verificar con un código</button></div>
    <p className={local.register}>¿Todavía no tenés cuenta? <Link className={styles.subtle} to="/register">Crear cuenta</Link></p>
  </FormPage>;
}
