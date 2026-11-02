import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import api from "../../api/api";
import style from "./EditProfile.module.css";

export default function EditProfile({ onClose, onSaved }) {
  const dialog = useRef(null);
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus();
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
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const changePhoto = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type) || selected.size > 5 * 1024 * 1024) {
      setError("Elegí una imagen JPG, PNG o WebP de hasta 5 MB.");
      event.target.value = "";
      return;
    }
    setError("");
    setFile(selected);
  };

  const save = async (event) => {
    event.preventDefault();
    if (saving) return;
    const username = (profile.username || "").trim();
    const ubication = (profile.ubication || "").trim();
    if (!username || !ubication) { setError("Completá tu nombre de usuario y ubicación."); return; }
    setSaving(true);
    setError("");
    try {
      let image = profile.image || "";
      if (file) {
        const form = new FormData();
        form.append("file", file);
        form.append("upload_preset", "userProfilePictures");
        // Use a separate client so the account token never reaches Cloudinary.
        const uploaded = await axios.post("https://api.cloudinary.com/v1_1/dsc4kqz3g/image/upload/", form, { timeout: 30000 });
        image = uploaded.data.secure_url;
        setProfile((current) => ({ ...current, image }));
        setFile(null);
      }
      const { data } = await api.put(`/users/${profile.id}`, { username, ubication, image });
      onSaved(data.user);
    } catch (failure) {
      setError(failure.response?.data?.error && typeof failure.response.data.error === "string"
        ? failure.response.data.error : "No pudimos guardar los cambios. Intentá nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <dialog ref={dialog} className={style.dialog} aria-labelledby="edit-profile-title"
      onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }}>
      <div className={style.heading}>
        <h2 id="edit-profile-title">Editar mis datos</h2>
        <button type="button" onClick={onClose} disabled={saving} aria-label="Cerrar edición">×</button>
      </div>
      {loading ? <p role="status">Cargando tus datos…</p> : profile && (
        <form onSubmit={save} aria-busy={saving}>
          <fieldset disabled={saving} className={style.fields}>
            <div className={style.photo}>
              <img src={preview || profile.image || "/user.png"} alt="Vista previa de tu foto" referrerPolicy="no-referrer" />
              <label htmlFor="profile-photo">Foto de perfil
                <input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={changePhoto} />
                <small>JPG, PNG o WebP. Hasta 5 MB.</small>
              </label>
            </div>
            <label htmlFor="profile-name">Nombre de usuario
              <input id="profile-name" autoComplete="nickname" required maxLength={255} value={profile.username || ""}
                onChange={(event) => setProfile({ ...profile, username: event.target.value })} />
            </label>
            <label htmlFor="profile-location">Ubicación
              <input id="profile-location" autoComplete="address-level2" required maxLength={255} placeholder="Provincia, localidad"
                value={profile.ubication || ""} onChange={(event) => setProfile({ ...profile, ubication: event.target.value })} />
            </label>
            <label htmlFor="profile-email">Correo de la cuenta
              <input id="profile-email" type="email" value={profile.email || ""} readOnly aria-describedby="email-help" />
              <small id="email-help">El correo de acceso no se puede cambiar desde el perfil.</small>
            </label>
          </fieldset>
          {error && <p className={style.error} role="alert">{error}</p>}
          <div className={style.actions}>
            <button type="button" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" disabled={saving} className={style.save}>{saving ? "Guardando…" : "Guardar cambios"}</button>
          </div>
        </form>
      )}
      {!loading && !profile && <div><p role="alert" className={style.error}>{error}</p><button type="button" onClick={() => setAttempt(attempt + 1)}>Reintentar</button></div>}
    </dialog>, document.body,
  );
}
