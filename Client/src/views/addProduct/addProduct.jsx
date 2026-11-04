import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import api from "../../api/api";
import { Field, FormPage, FormStatus } from "../../components/forms/FormUI";
import forms from "../../components/forms/FormUI.module.css";
import { errorMessage, fieldProps, focusFirstError } from "../../utils/formValidation";
import { validateDescription, validateTitle, validateImageFile } from "./validation";
import style from "./AddProduct.module.css";

const MAX_IMAGES = 3;
const categories = ["🧁 Alimentos", "🍹 Bebidas", "⚱️ Antiguedades", "🎨 Arte y artesanías", "⚽️ Articulos deportivos", "📺 Audio y video", "📷 Cámaras y accesorios", "📱 Celulares", "💻 Computadoras", "🔌 Electrodomésticos", "🛠️ Herramientas", "🎸 Instrumentos musicales", "💍 Joyas y relojes", "🪑 Muebles y hogar", "🚗 Rodados con motor", "🚲 Rodados sin motor", "👕 Ropa e indumentaria", "🎮 Videojuegos", "🛒 Varios"];
const initialValues = { title: "", description: "", category: "", province: "", locality: "" };

// Abort stale requests when the province changes and expose recoverable errors.
function useLocationOptions(province) {
  const [provinces, setProvinces] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [provinceLoading, setProvinceLoading] = useState(true);
  const [localityLoading, setLocalityLoading] = useState(false);
  const [provinceError, setProvinceError] = useState("");
  const [localityError, setLocalityError] = useState("");
  const [provinceAttempt, setProvinceAttempt] = useState(0);
  const [localityAttempt, setLocalityAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    setProvinceLoading(true); setProvinceError("");
    fetch("https://apis.datos.gob.ar/georef/api/provincias", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data) => {
        if (!data.provincias?.length) throw new Error();
        if (active) setProvinces([...data.provincias].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      })
      .catch(() => { if (active) setProvinceError("No pudimos cargar las provincias. Volvé a intentarlo."); })
      .finally(() => { clearTimeout(timeout); if (active) setProvinceLoading(false); });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [provinceAttempt]);
  useEffect(() => {
    if (!province) { setLocalities([]); setLocalityLoading(false); setLocalityError(""); return; }
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    setLocalities([]); setLocalityLoading(true); setLocalityError("");
    fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${encodeURIComponent(province)}&max=5000`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data) => {
        if (!data.localidades?.length) throw new Error();
        if (active) setLocalities([...data.localidades].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      })
      .catch(() => { if (active) setLocalityError("No pudimos cargar las localidades de esa provincia. Intentá nuevamente."); })
      .finally(() => { clearTimeout(timeout); if (active) setLocalityLoading(false); });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [province, localityAttempt]);
  return { provinces, localities, provinceLoading, localityLoading, provinceError, localityError,
    retryProvinces: () => setProvinceAttempt((value) => value + 1), retryLocalities: () => setLocalityAttempt((value) => value + 1) };
}

export default function AddProduct() {
  const navigate = useNavigate();
  const form = useRef(null);
  const fileInput = useRef(null);
  const filesRef = useRef([]);
  const uploadCache = useRef(new Map());
  const busyRef = useRef(false);
  const validatingRef = useRef(false);
  const mounted = useRef(true);
  const [values, setValues] = useState(initialValues);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);
  const [checkingImages, setCheckingImages] = useState(false);
  const [imageIssue, setImageIssue] = useState("");
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [premium, setPremium] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const locations = useLocationOptions(values.province);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; filesRef.current.forEach((item) => URL.revokeObjectURL(item.preview)); };
  }, []);

  const validate = (current = values) => ({
    title: validateTitle(current.title),
    category: categories.includes(current.category) ? "" : "Elegí la categoría que mejor describe tu producto.",
    description: validateDescription(current.description),
    images: filesRef.current.length ? imageIssue : "Agregá al menos una foto de tu producto.",
    province: current.province ? "" : "Elegí la provincia donde se encuentra el producto.",
    locality: current.locality ? "" : "Elegí una localidad para coordinar los canjes.",
  });
  const change = (name, value) => {
    const next = { ...values, [name]: value, ...(name === "province" ? { locality: "" } : {}) };
    setValues(next); setSubmitError("");
    if (touched[name] || errors[name]) setErrors((current) => ({ ...current, [name]: validate(next)[name] }));
    if (name === "province") {
      setErrors((current) => ({ ...current, locality: "" }));
      setTouched((current) => ({ ...current, locality: false }));
    }
  };
  const blur = (name) => {
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => ({ ...current, [name]: validate()[name] }));
  };
  const chooseFiles = async (selected) => {
    if (busyRef.current || validatingRef.current || !selected.length) return;
    if (filesRef.current.length + selected.length > MAX_IMAGES) {
      const issue = `Podés subir hasta ${MAX_IMAGES} fotos. Quitá una antes de agregar más.`;
      setImageIssue(issue);
      setErrors((current) => ({ ...current, images: issue }));
      focusFirstError(form.current, { images: true }); return;
    }
    validatingRef.current = true; setCheckingImages(true);
    let issue = "";
    const additions = [];
    try {
      for (const file of selected) {
        const invalid = await validateImageFile(file);
        if (invalid) { issue = `${file.name}: ${invalid}.`; continue; }
        if ([...filesRef.current, ...additions].some((item) => item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified)) {
          issue = "Esa foto ya está agregada. Elegí una diferente."; continue;
        }
        additions.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) });
      }
      if (!mounted.current) { additions.forEach((item) => URL.revokeObjectURL(item.preview)); return; }
      const next = [...filesRef.current, ...additions];
      filesRef.current = next; setFiles(next);
      setImageIssue(issue);
      setErrors((current) => ({ ...current, images: issue }));
      setSubmitError("");
    } catch { if (mounted.current) { const issue = "No pudimos leer esa imagen. Probá con otra foto."; setImageIssue(issue); setErrors((current) => ({ ...current, images: issue })); } }
    finally { validatingRef.current = false; if (mounted.current) setCheckingImages(false); }
  };
  const removeFile = (id) => {
    const removed = filesRef.current.find((item) => item.id === id);
    if (removed) { URL.revokeObjectURL(removed.preview); uploadCache.current.delete(removed.file); }
    const next = filesRef.current.filter((item) => item.id !== id);
    filesRef.current = next; setFiles(next);
    setImageIssue("");
    setErrors((current) => ({ ...current, images: next.length ? "" : "Agregá al menos una foto de tu producto." }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busyRef.current || validatingRef.current) return;
    const invalid = validate();
    setErrors(invalid); setTouched(Object.fromEntries(Object.keys(invalid).map((key) => [key, true])));
    if (Object.values(invalid).some(Boolean)) { focusFirstError(form.current, invalid); return; }
    busyRef.current = true; setBusy(true); setSubmitError(""); setPremium(false); setProgress(0);
    let uploading = true;
    try {
      setStatus("Preparando tus fotos…");
      const { data: signatureData } = await api.get("/posts/cloudinary/signature");
      const { apiKey, timestamp, signature, cloudName } = signatureData;
      if (!apiKey || !timestamp || !signature || !cloudName) throw new Error();
      const image = [];
      for (const [index, item] of files.entries()) {
        setStatus(`Subiendo foto ${index + 1} de ${files.length}…`);
        let uploadedUrl = uploadCache.current.get(item.file);
        if (!uploadedUrl) {
          const data = new FormData();
          data.append("file", item.file); data.append("api_key", apiKey); data.append("timestamp", timestamp);
          data.append("signature", signature); data.append("folder", "postimages");
          // Do not forward the Circula session token to the image provider.
          const uploaded = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, data, { timeout: 45000 });
          if (!uploaded.data.secure_url?.startsWith("https://")) throw new Error();
          uploadedUrl = uploaded.data.secure_url.replace("/upload/", "/upload/q_auto,f_auto/");
          uploadCache.current.set(item.file, uploadedUrl);
        }
        image.push(uploadedUrl); setProgress(index + 1);
      }
      uploading = false; setStatus("Publicando tu producto…");
      const { data } = await api.post("/posts/", { title: values.title.trim(), description: values.description.trim(), category: values.category, image, ubication: `${values.province}, ${values.locality}` });
      await Swal.fire({ toast: true, position: "top-end", icon: "success", title: "¡Tu producto ya está publicado!", timer: 1600, showConfirmButton: false });
      navigate(data?.id ? `/detail/${data.id}` : "/");
    } catch (failure) {
      const serverFields = failure.response?.data?.fieldErrors;
      if (serverFields && typeof serverFields === "object") {
        const mapped = Object.fromEntries(Object.entries(serverFields).map(([key, value]) => [key === "ubication" ? "locality" : key === "image" ? "images" : key, value]));
        setErrors(mapped); focusFirstError(form.current, mapped);
      } else if (uploading) {
        const imageError = { images: "No pudimos subir las fotos. Revisá tu conexión y volvé a publicar; las fotos que se subieron ya están guardadas." };
        setErrors((current) => ({ ...current, ...imageError })); focusFirstError(form.current, imageError);
      } else {
        const message = errorMessage(failure, "No pudimos publicar el producto. Conservamos tus datos para que puedas reintentar.");
        setSubmitError(message); setPremium(/premium/i.test(message));
      }
    } finally { busyRef.current = false; setBusy(false); setStatus(""); }
  };
  const handlePremium = async () => {
    if (paymentLoading) return;
    setPaymentLoading(true);
    try {
      const { data } = await api.post("/plans/create-order", { title: "Premium" });
      if (!data.init_point?.startsWith("https://")) throw new Error();
      window.location.assign(data.init_point);
    } catch (failure) { setSubmitError(errorMessage(failure, "No pudimos abrir el pago. Intentá nuevamente más tarde.")); }
    finally { setPaymentLoading(false); }
  };

  return <FormPage wide eyebrow="DALE OTRA VIDA" title="Publicá tu producto" description="Contá qué tenés para canjear. Las fotos claras y una buena descripción ayudan a encontrar el intercambio ideal.">
    <form ref={form} onSubmit={handleSubmit} noValidate aria-busy={busy}>
      <p className={style.requiredNote}>Los campos con <span aria-hidden="true">*</span> son obligatorios.</p>
      <fieldset disabled={busy} className={style.fieldset}>
        <section className={forms.section} aria-labelledby="product-info-title">
          <h2 id="product-info-title" className={forms.sectionTitle}>1. Contanos qué ofrecés</h2>
          <p className={forms.sectionDescription}>Usá un nombre concreto para que sea fácil de encontrar.</p>
          <div className={forms.grid}>
            <Field id="product-title" label="Nombre del producto" required hint="Entre 3 y 30 caracteres." error={errors.title}>
              <input {...fieldProps("product-title", errors.title, true)} className={forms.control} name="title" required maxLength={30} placeholder="Ej.: Bicicleta rodado 26" value={values.title} onChange={(event) => change("title", event.target.value)} onBlur={() => blur("title")} />
            </Field>
            <Field id="product-category" label="Categoría" required error={errors.category}>
              <select {...fieldProps("product-category", errors.category)} className={forms.control} name="category" required value={values.category} onChange={(event) => change("category", event.target.value)} onBlur={() => blur("category")}><option value="">Elegí una categoría</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select>
            </Field>
          </div>
          <Field id="product-description" label="Descripción (opcional)" hint="Contá el estado, las medidas y qué incluye. Hasta 250 caracteres." error={errors.description}>
            <textarea {...fieldProps("product-description", errors.description, true)} className={forms.control} name="description" maxLength={250} rows={4} placeholder="Ej.: En muy buen estado, con poco uso. Incluye casco y luces. Tiene una pequeña marca en el cuadro." value={values.description} onChange={(event) => change("description", event.target.value)} onBlur={() => blur("description")} />
            <p className={style.counter}>{values.description.length}/250</p>
          </Field>
        </section>
        <section className={forms.section} aria-labelledby="product-photos-title">
          <h2 id="product-photos-title" className={forms.sectionTitle}>2. Mostralo con fotos</h2>
          <p className={forms.sectionDescription}>La primera imagen será la portada. Usá fotos propias, con buena luz y sin datos personales.</p>
          <Field id="product-images" label="Fotos del producto" required hint="De 1 a 3 imágenes JPG o PNG. Hasta 5 MB por foto." error={errors.images}>
            <div className={`${forms.upload} ${style.uploadArea} ${dragging ? style.dragging : ""}`} onDragOver={(event) => { event.preventDefault(); if (!busy && !checkingImages) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); void chooseFiles([...event.dataTransfer.files]); }}>
              <span className={style.uploadIcon} aria-hidden="true">＋</span>
              <strong>{checkingImages ? "Revisando las imágenes…" : dragging ? "Soltá tus fotos acá" : "Elegí tus fotos o arrastralas acá"}</strong>
              <span className={forms.help}>{files.length}/{MAX_IMAGES} fotos agregadas</span>
              <input {...fieldProps("product-images", errors.images, true)} ref={fileInput} className={style.fileInput} name="images" type="file" accept="image/jpeg,image/png" multiple disabled={busy || checkingImages} onChange={(event) => { const selected = [...(event.target.files || [])]; event.target.value = ""; void chooseFiles(selected); }} />
            </div>
          </Field>
          {imageIssue && files.length > 0 && <button type="button" className={forms.subtle} onClick={() => { setImageIssue(""); setErrors((current) => ({ ...current, images: "" })); }}>Conservar solo las fotos ya agregadas</button>}
          {files.length > 0 && <div className={style.previews}>{files.map((item, index) => <figure className={style.previewItem} key={item.id}><img src={item.preview} alt={`Foto ${index + 1} del producto`} /><figcaption><span>{index === 0 ? "Portada" : `Foto ${index + 1}`}</span><button type="button" className={style.remove} disabled={busy} onClick={() => removeFile(item.id)} aria-label={`Quitar foto ${index + 1}`}>Quitar</button></figcaption></figure>)}</div>}
        </section>
        <section className={forms.section} aria-labelledby="product-location-title">
          <h2 id="product-location-title" className={forms.sectionTitle}>3. ¿Dónde se puede canjear?</h2>
          <p className={forms.sectionDescription}>Mostramos tu localidad para conectar con personas cerca. No publiques tu dirección exacta.</p>
          <div className={forms.grid}>
            <Field id="product-province" label="Provincia" required error={locations.provinceError || errors.province}>
              <select {...fieldProps("product-province", locations.provinceError || errors.province)} className={forms.control} name="province" required disabled={busy || locations.provinceLoading} value={values.province} onChange={(event) => change("province", event.target.value)} onBlur={() => blur("province")}><option value="">{locations.provinceLoading ? "Cargando provincias…" : "Elegí tu provincia"}</option>{locations.provinces.map((province) => <option key={province.id} value={province.nombre}>{province.nombre}</option>)}</select>
              {locations.provinceError && <button type="button" className={forms.subtle} onClick={locations.retryProvinces}>Reintentar carga de provincias</button>}
            </Field>
            <Field id="product-locality" label="Localidad" required hint={!values.province ? "Primero elegí una provincia." : undefined} error={locations.localityError || errors.locality}>
              <select {...fieldProps("product-locality", locations.localityError || errors.locality, !values.province)} className={forms.control} name="locality" required disabled={busy || !values.province || locations.localityLoading} value={values.locality} onChange={(event) => change("locality", event.target.value)} onBlur={() => blur("locality")}><option value="">{locations.localityLoading ? "Cargando localidades…" : "Elegí tu localidad"}</option>{locations.localities.map((locality) => <option key={locality.id} value={locality.nombre}>{locality.nombre}</option>)}</select>
              {locations.localityError && <button type="button" className={forms.subtle} onClick={locations.retryLocalities}>Reintentar carga de localidades</button>}
            </Field>
          </div>
        </section>
      </fieldset>
      {submitError && <FormStatus kind="error">{submitError}</FormStatus>}
      {premium && <button className={forms.secondary} type="button" disabled={paymentLoading || busy} onClick={handlePremium}>{paymentLoading ? "Abriendo el pago…" : "Ver opción Premium"}</button>}
      {busy && <FormStatus><p className={style.progressText}>{status}</p><progress className={style.progress} max={files.length} value={progress} aria-label="Fotos subidas" /></FormStatus>}
      <div className={forms.actions}><button type="submit" className={forms.primary} disabled={busy || checkingImages || paymentLoading}>{busy ? "Publicando…" : checkingImages ? "Revisando fotos…" : "Publicar producto"}</button><button type="button" className={forms.secondary} disabled={busy || paymentLoading} onClick={() => navigate(-1)}>Cancelar</button></div>
    </form>
  </FormPage>;
}
