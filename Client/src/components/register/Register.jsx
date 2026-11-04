import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api.js";
import VerifyEmail from "../verifyEmail/VerifyEmail";
import { FormPage, Field, PasswordInput, PasswordChecklist, FormStatus } from "../forms/FormUI.jsx";
import styles from "../forms/FormUI.module.css";
import local from "./Register.module.css";
import { validateImageFile, validateUsername } from "./validations";
import { fieldProps, focusFirstError, emailError, passwordError, confirmPasswordError, errorMessage } from "../../utils/formValidation.js";

const empty = { username: "", email: "", password: "", repeatPassword: "", province: "", locality: "" };
const validate = (values, image) => ({
  username: validateUsername(values.username), email: emailError(values.email), password: passwordError(values.password),
  repeatPassword: confirmPasswordError(values.repeatPassword, values.password),
  image: image ? "" : "Agregá una foto para que otras personas puedan reconocerte.",
  province: values.province ? "" : "Elegí tu provincia.", locality: values.locality ? "" : "Elegí tu localidad.",
});

export default function Register({ setAuth }) {
  const navigate = useNavigate();
  const form = useRef(null);
  const fileInput = useRef(null);
  const fileVersion = useRef(0);
  const uploaded = useRef(null);
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checkingImage, setCheckingImage] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("");
  const [verification, setVerification] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [provinceLoading, setProvinceLoading] = useState(true);
  const [localityLoading, setLocalityLoading] = useState(false);
  const [provinceFailure, setProvinceFailure] = useState(false);
  const [localityFailure, setLocalityFailure] = useState(false);
  const [provinceRetry, setProvinceRetry] = useState(0);
  const [localityRetry, setLocalityRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setProvinceLoading(true); setProvinceFailure(false);
    fetch("https://apis.datos.gob.ar/georef/api/provincias", { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => { if (!Array.isArray(data.provincias) || !data.provincias.length) throw new Error(); setProvinces(data.provincias); })
      .catch(() => { if (!controller.signal.aborted) setProvinceFailure(true); })
      .finally(() => { if (!controller.signal.aborted) setProvinceLoading(false); });
    return () => controller.abort();
  }, [provinceRetry]);
  useEffect(() => {
    if (!values.province) { setLocalities([]); setLocalityLoading(false); setLocalityFailure(false); return; }
    const controller = new AbortController();
    setLocalityLoading(true); setLocalityFailure(false); setLocalities([]);
    fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${encodeURIComponent(values.province)}&max=5000`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => { if (!Array.isArray(data.localidades) || !data.localidades.length) throw new Error(); setLocalities(data.localidades); })
      .catch(() => { if (!controller.signal.aborted) setLocalityFailure(true); })
      .finally(() => { if (!controller.signal.aborted) setLocalityLoading(false); });
    return () => controller.abort();
  }, [values.province, localityRetry]);
  useEffect(() => {
    if (!image) { setPreview(""); return; }
    const url = URL.createObjectURL(image); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  function change(event) {
    const { name, value } = event.target;
    const next = { ...values, [name]: value, ...(name === "province" ? { locality: "" } : {}) };
    setValues(next); setStatus("");
    const validation = validate(next, image);
    setErrors((previous) => ({ ...previous,
      [name]: touched[name] || submitted ? validation[name] : "",
      ...(name === "password" && (touched.repeatPassword || submitted) ? { repeatPassword: validation.repeatPassword } : {}),
      ...(name === "province" ? { locality: "" } : {}),
    }));
  }
  function blur(event) {
    const { name } = event.target;
    setTouched((previous) => ({ ...previous, [name]: true }));
    setErrors((previous) => ({ ...previous, [name]: validate(values, image)[name] }));
  }
  async function chooseImage(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    const version = ++fileVersion.current;
    setCheckingImage(true); setStatus(""); uploaded.current = null;
    try {
      const issue = await validateImageFile(selected);
      if (version !== fileVersion.current) return;
      setImage(issue ? null : selected);
      setErrors((previous) => ({ ...previous, image: issue || "" }));
      if (issue && fileInput.current) fileInput.current.value = "";
    } catch {
      if (version !== fileVersion.current) return;
      setImage(null); setErrors((previous) => ({ ...previous, image: "No pudimos abrir esa imagen. Probá con otra foto JPG o PNG." }));
    } finally { if (version === fileVersion.current) setCheckingImage(false); }
  }
  function removeImage() {
    fileVersion.current++; setCheckingImage(false); setImage(null); uploaded.current = null;
    if (fileInput.current) fileInput.current.value = "";
    setErrors((previous) => ({ ...previous, image: submitted ? validate(values, null).image : "" }));
  }
  async function submit(event) {
    event.preventDefault();
    if (busy || checkingImage) return;
    setSubmitted(true); setStatus("");
    const invalid = validate(values, image); setErrors(invalid);
    if (Object.values(invalid).some(Boolean)) { focusFirstError(form.current, invalid); return; }
    setBusy(true);
    let stage = "image";
    try {
      let photo = uploaded.current?.file === image ? uploaded.current.url : "";
      if (!photo) {
        const data = new FormData(); data.append("file", image); data.append("upload_preset", "userProfilePictures");
        const response = await fetch("https://api.cloudinary.com/v1_1/dsc4kqz3g/image/upload/", { method: "POST", body: data, signal: AbortSignal.timeout(45000) });
        if (!response.ok) throw new Error();
        photo = (await response.json()).secure_url;
        if (!photo) throw new Error();
        uploaded.current = { file: image, url: photo };
      }
      stage = "account";
      const { data } = await api.post("/users/register", {
        username: values.username.trim(), email: values.email.trim().toLowerCase(), password: values.password,
        image: photo, ubication: `${values.province}, ${values.locality}`, origin: "DB",
      });
      if (!data.verificationRequired) throw new Error();
      setVerification({ credentials: { email: data.email, password: values.password }, sent: data.verificationSent });
      setValues(empty); setImage(null); setErrors({}); setTouched({}); setSubmitted(false); uploaded.current = null;
      if (fileInput.current) fileInput.current.value = "";
    } catch (error) {
      const serverErrors = error.response?.data?.fieldErrors;
      if (stage === "account" && serverErrors && typeof serverErrors === "object") {
        const mapped = Object.fromEntries(Object.entries(serverErrors).filter(([field, message]) => ["username", "email", "password", "province", "locality", "image"].includes(field) && typeof message === "string" && message));
        if (Object.keys(mapped).length) {
          setErrors((previous) => ({ ...previous, ...mapped }));
          focusFirstError(form.current, mapped);
          return;
        }
      }
      const message = stage === "image" ? "No pudimos subir la foto. Revisá tu conexión y volvé a intentarlo; tus datos siguen acá." : errorMessage(error, "No pudimos crear tu cuenta. Revisá tu conexión e intentá nuevamente.");
      const field = stage === "image" ? "image" : /usuario|username/i.test(message) ? "username" : /correo|email|e-mail/i.test(message) ? "email" : /contraseña|password/i.test(message) ? "password" : null;
      if (field) { setErrors((previous) => ({ ...previous, [field]: message })); focusFirstError(form.current, { [field]: message }); }
      else setStatus(message);
    } finally { setBusy(false); }
  }
  const locked = busy || checkingImage;
  return <FormPage eyebrow="EMPEZÁ A CIRCULAR" title="Creá tu cuenta" description="Dale una nueva vida a lo que ya no usás. Completá tus datos y confirmá tu correo con un código de 6 dígitos." wide>
    {verification && <VerifyEmail {...verification} onClose={() => { setVerification(null); navigate("/login"); }} onVerified={(usuario) => { setVerification(null); setAuth(true, usuario); navigate("/profile", { replace: true }); }} />}
    <form ref={form} onSubmit={submit} noValidate aria-busy={busy}>
      <section className={styles.section} aria-labelledby="register-account-title">
        <h2 id="register-account-title" className={styles.sectionTitle}>Tu acceso a Circula</h2>
        <p className={styles.sectionDescription}>Los campos marcados como obligatorios son necesarios para crear tu cuenta.</p>
        <div className={styles.grid}>
          <Field id="register-username" label="Nombre de usuario" required hint="Entre 3 y 30 caracteres. Así te verá la comunidad." error={errors.username}>
            <input {...fieldProps("register-username", errors.username, true)} className={styles.control} name="username" placeholder="Por ejemplo, charlyklema" autoComplete="nickname" value={values.username} onChange={change} onBlur={blur} disabled={locked} required />
          </Field>
          <Field id="register-email" label="Correo electrónico" required hint="Usaremos este correo para verificar tu cuenta e iniciar sesión." error={errors.email}>
            <input {...fieldProps("register-email", errors.email, true)} className={styles.control} name="email" type="email" inputMode="email" placeholder="vos@ejemplo.com" autoComplete="email" autoCapitalize="none" spellCheck={false} value={values.email} onChange={change} onBlur={blur} disabled={locked} required />
          </Field>
          <div>
            <Field id="register-password" label="Contraseña" required error={errors.password}>
              <PasswordInput {...fieldProps("register-password", errors.password)} className={styles.control} name="password" placeholder="Creá una contraseña segura" autoComplete="new-password" value={values.password} onChange={change} onBlur={blur} disabled={locked} required />
            </Field>
            <PasswordChecklist value={values.password} />
          </div>
          <Field id="register-repeatPassword" label="Repetí tu contraseña" required hint="Ingresá la misma contraseña para confirmar." error={errors.repeatPassword}>
            <PasswordInput {...fieldProps("register-repeatPassword", errors.repeatPassword, true)} className={styles.control} name="repeatPassword" placeholder="Volvé a escribir tu contraseña" autoComplete="new-password" value={values.repeatPassword} onChange={change} onBlur={blur} disabled={locked} required />
          </Field>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="register-profile-title">
        <h2 id="register-profile-title" className={styles.sectionTitle}>Presentate a la comunidad</h2>
        <p className={styles.sectionDescription}>Tu foto y tu localidad ayudan a conectar con personas cerca tuyo.</p>
        <Field id="register-image" label="Foto de perfil" required hint="Elegí una foto JPG o PNG de hasta 5 MB." error={errors.image}>
          <div className={local.photoArea}>
            {preview && <img className={local.avatar} src={preview} alt="Vista previa de tu foto de perfil" />}
            <div className={local.photoControls}>
              <input {...fieldProps("register-image", errors.image, true)} ref={fileInput} className={styles.control} type="file" name="image" accept="image/jpeg,image/png" onChange={chooseImage} disabled={locked} required={!image} />
              {image && <div className={styles.inline}><span className={local.fileName}>{image.name}</span><button className={styles.subtle} type="button" onClick={removeImage} disabled={locked}>Quitar foto</button></div>}
              {checkingImage && <p role="status" className={styles.help}>Comprobando la imagen…</p>}
            </div>
          </div>
        </Field>
        <div className={styles.grid}>
          <Field id="register-province" label="Provincia" required error={errors.province}>
            <select {...fieldProps("register-province", errors.province)} className={styles.control} name="province" value={values.province} onChange={change} onBlur={blur} disabled={locked || provinceLoading} required>
              <option value="">{provinceLoading ? "Cargando provincias…" : "Elegí tu provincia"}</option>
              {[...provinces].sort((a, b) => a.nombre.localeCompare(b.nombre)).map((province) => <option key={province.id} value={province.nombre}>{province.nombre}</option>)}
            </select>
            {provinceFailure && <div className={local.loadError} role="alert">No pudimos cargar las provincias. <button type="button" className={styles.subtle} onClick={() => setProvinceRetry((n) => n + 1)}>Reintentar</button></div>}
          </Field>
          <Field id="register-locality" label="Localidad" required hint="Mostramos tu localidad, nunca tu dirección exacta." error={errors.locality}>
            <select {...fieldProps("register-locality", errors.locality, true)} className={styles.control} name="locality" value={values.locality} onChange={change} onBlur={blur} disabled={locked || !values.province || localityLoading} required>
              <option value="">{localityLoading ? "Cargando localidades…" : !values.province ? "Primero elegí una provincia" : "Elegí tu localidad"}</option>
              {[...localities].sort((a, b) => a.nombre.localeCompare(b.nombre)).map((locality) => <option key={locality.id} value={locality.nombre}>{locality.nombre}</option>)}
            </select>
            {localityFailure && <div className={local.loadError} role="alert">No pudimos cargar las localidades. <button type="button" className={styles.subtle} onClick={() => setLocalityRetry((n) => n + 1)}>Reintentar</button></div>}
          </Field>
        </div>
      </section>
      {status && <FormStatus kind="error">{status}</FormStatus>}
      <div className={styles.actions}><button className={styles.primary} type="submit" disabled={locked}>{busy ? "Creando tu cuenta…" : checkingImage ? "Comprobando foto…" : "Crear cuenta y verificar correo"}</button><p className={styles.help}>¿Ya tenés una cuenta? <Link className={styles.subtle} to="/login">Iniciá sesión</Link></p></div>
    </form>
  </FormPage>;
}
