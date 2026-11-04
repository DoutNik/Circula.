import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import api from "../../api/api";
import { Field, FormStatus } from "../forms/FormUI";
import formStyle from "../forms/FormUI.module.css";
import { errorMessage, fieldProps, focusFirstError } from "../../utils/formValidation";
import style from "./EditProfile.module.css";

const validateProfile = (profile) => ({
  username: !profile.username?.trim() ? "Escribí cómo querés que te vean en Circula." : profile.username.trim().length > 255 ? "Usá hasta 255 caracteres para tu nombre." : "",
  ubication: !profile.ubication?.trim() ? "Completá tu provincia y localidad." : profile.ubication.trim().length > 255 ? "La ubicación puede tener hasta 255 caracteres." : "",
});

async function photoError(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Elegí una imagen JPG, PNG o WebP.";
  if (!file.size) return "La imagen está vacía. Elegí otra foto.";
  if (file.size > 5 * 1024 * 1024) return "La foto supera los 5 MB. Elegí una más liviana.";
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return "";
  } catch { return "No pudimos abrir esa imagen. Probá con otra foto."; }
  finally { URL.revokeObjectURL(url); }
}

export default function EditProfile({ onClose, onSaved }) {
  const dialog = useRef(null);
  const form = useRef(null);
  const photoInput = useRef(null);
  const uploadCache = useRef(null);
  const saveLock = useRef(false);
  const photoSequence = useRef(0);
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingPhoto, setCheckingPhoto] = useState(false);
  const [photoIssue, setPhotoIssue] = useState("");
  const [progress, setProgress] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      photoSequence.current++;
      element.close();
      document.body.style.overflow = overflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api.get("/users/userId").then(({ data }) => {
      if (active) setProfile(data);
    }).catch(() => {
      if (active) setError("No pudimos cargar tus datos. Intentá nuevamente.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const change = (name, value) => {
    const next = { ...profile, [name]: value };
    setProfile(next);
    setError("");
    if (touched[name] || errors[name]) setErrors((current) => ({ ...current, [name]: validateProfile(next)[name] }));
  };
  const blur = (name) => {
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => ({ ...current, [name]: validateProfile(profile)[name] }));
  };
  const changePhoto = async (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    const input = event.target;
    const sequence = ++photoSequence.current;
    setCheckingPhoto(true);
    const message = await photoError(selected);
    if (sequence !== photoSequence.current) return;
    setCheckingPhoto(false);
    setPhotoIssue(message);
    setErrors((current) => ({ ...current, image: message }));
    if (message) { input.value = ""; return; }
    setError("");
    uploadCache.current = null;
    setFile(selected);
  };
  const restorePhoto = () => {
    photoSequence.current++;
    setCheckingPhoto(false);
    setPhotoIssue("");
    setFile(null);
    uploadCache.current = null;
    if (photoInput.current) photoInput.current.value = "";
    setErrors((current) => ({ ...current, image: "" }));
  };

  const save = async (event) => {
    event.preventDefault();
    if (saveLock.current || checkingPhoto) return;
    const nextErrors = { ...validateProfile(profile), image: photoIssue };
    setErrors((current) => ({ ...current, ...nextErrors }));
    setTouched({ username: true, ubication: true });
    if (Object.values(nextErrors).some(Boolean)) { focusFirstError(form.current, nextErrors); return; }
    saveLock.current = true;
    setSaving(true);
    setError("");
    let uploadingPhoto = false;
    try {
      let image = profile.image || "";
      if (file) {
        uploadingPhoto = true;
        setProgress("Subiendo tu nueva foto…");
        if (uploadCache.current?.file === file) image = uploadCache.current.url;
        else {
          const upload = new FormData();
          upload.append("file", file);
          upload.append("upload_preset", "userProfilePictures");
          // This separate client never sends the account token to Cloudinary.
          const uploaded = await axios.post("https://api.cloudinary.com/v1_1/dsc4kqz3g/image/upload/", upload, { timeout: 30000 });
          if (!uploaded.data.secure_url?.startsWith("https://")) throw new Error("No se pudo completar la subida de la foto.");
          image = uploaded.data.secure_url;
          uploadCache.current = { file, url: image };
        }
      }
      uploadingPhoto = false;
      setProgress("Guardando tus datos…");
      const { data } = await api.put(`/users/${profile.id}`, { username: profile.username.trim(), ubication: profile.ubication.trim(), image });
      onSaved(data.user);
    } catch (failure) {
      const message = errorMessage(failure, "No pudimos guardar tus datos. Conservamos lo que completaste para que puedas reintentar.");
      const serverFields = failure.response?.data?.fieldErrors;
      if (serverFields && typeof serverFields === "object") {
        setErrors(serverFields);
        focusFirstError(form.current, serverFields);
      } else if (uploadingPhoto) {
        const next = { image: "No pudimos subir la foto. Revisá tu conexión y volvé a guardar." };
        setErrors((current) => ({ ...current, ...next }));
        focusFirstError(form.current, next);
      } else if (failure.response?.status === 409 || /nombre.*(uso|registrado)/i.test(message)) {
        const next = { username: "Ese nombre de usuario ya está en uso. Probá con otro." };
        setErrors((current) => ({ ...current, ...next }));
        focusFirstError(form.current, next);
      } else setError(message);
    } finally {
      saveLock.current = false;
      setSaving(false);
      setProgress("");
    }
  };

  return createPortal(
    <dialog ref={dialog} className={style.dialog} aria-labelledby="edit-profile-title" aria-describedby="edit-profile-description"
      onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }}>
      <div className={style.heading}>
        <div><p className={style.eyebrow}>TU PERFIL</p><h2 id="edit-profile-title">Que te conozcan mejor</h2></div>
        <button type="button" className={style.close} onClick={onClose} disabled={saving} aria-label="Cerrar edición">×</button>
      </div>
      <p id="edit-profile-description" className={style.description}>Una foto y una ubicación claras ayudan a encontrar personas con quienes canjear.</p>
      {loading ? <FormStatus>Cargando tus datos…</FormStatus> : profile && (
        <form ref={form} onSubmit={save} noValidate aria-busy={saving}>
          <fieldset disabled={saving} className={style.fields}>
            <div className={style.photo}>
              <img src={preview || profile.image || "/user.png"} alt="Vista previa de tu foto de perfil" referrerPolicy="no-referrer" />
              <div className={style.photoControl}>
                <Field id="profile-photo" label="Foto de perfil" hint="JPG, PNG o WebP. Hasta 5 MB." error={errors.image}>
                  <input {...fieldProps("profile-photo", errors.image, "Foto")} ref={photoInput} name="image" className={formStyle.control} type="file" accept="image/jpeg,image/png,image/webp" onChange={changePhoto} disabled={checkingPhoto || saving} />
                </Field>
                {checkingPhoto && <p className={formStyle.help} role="status">Revisando la imagen…</p>}
                {(file || photoIssue) && <button className={formStyle.subtle} type="button" onClick={restorePhoto}>Conservar mi foto actual</button>}
              </div>
            </div>
            <Field id="profile-name" label="Nombre de usuario" required hint="Así aparecerás en tus publicaciones y conversaciones." error={errors.username}>
              <input {...fieldProps("profile-name", errors.username, "Nombre")} name="username" className={formStyle.control} autoComplete="nickname" required maxLength={255} placeholder="Ej.: charlyklema" value={profile.username || ""}
                onChange={(event) => change("username", event.target.value)} onBlur={() => blur("username")} />
            </Field>
            <Field id="profile-location" label="Ubicación" required hint="Solo provincia y localidad. No hace falta tu dirección exacta." error={errors.ubication}>
              <input {...fieldProps("profile-location", errors.ubication, "Ubicación")} name="ubication" className={formStyle.control} autoComplete="address-level2" required maxLength={255} placeholder="Ej.: Córdoba, Villa Carlos Paz"
                value={profile.ubication || ""} onChange={(event) => change("ubication", event.target.value)} onBlur={() => blur("ubication")} />
            </Field>
            <Field id="profile-email" label="Correo de la cuenta" hint="Tu correo de acceso es fijo y no se modifica desde acá.">
              <input {...fieldProps("profile-email", "", "Correo")} className={formStyle.control} type="email" value={profile.email || ""} readOnly />
            </Field>
          </fieldset>
          {error && <FormStatus kind="error">{error}</FormStatus>}
          {saving && <FormStatus>{progress}</FormStatus>}
          <div className={formStyle.actions}>
            <button type="button" className={formStyle.secondary} onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" disabled={saving || checkingPhoto} className={formStyle.primary}>{saving ? "Guardando…" : "Guardar cambios"}</button>
          </div>
        </form>
      )}
      {!loading && !profile && <div><FormStatus kind="error">{error}</FormStatus><button type="button" className={formStyle.secondary} onClick={() => setAttempt((value) => value + 1)}>Volver a cargar mis datos</button></div>}
    </dialog>, document.body,
  );
}
