import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Field, FormPage, FormStatus } from "../forms/FormUI.jsx";
import forms from "../forms/FormUI.module.css";
import { errorMessage, fieldProps, focusFirstError } from "../../utils/formValidation.js";
import styles from "./FormReview.module.css";
import api from "../../api/api";

const ratingLabels = ["Muy mala", "Mala", "Regular", "Buena", "Excelente"];
const validate = ({ rating, title, description }) => ({
  rating: rating >= 1 && rating <= 5 ? "" : "Elegí una calificación de 1 a 5 estrellas.",
  title: !title.trim() ? "Escribí un título para tu reseña." : title.trim().length < 3 ? "El título necesita al menos 3 caracteres." : title.trim().length > 80 ? "Usá hasta 80 caracteres." : "",
  description: !description.trim() ? "Contá cómo fue tu experiencia con el canje." : description.trim().length < 3 ? "Contanos un poco más: escribí al menos 3 caracteres." : description.trim().length > 500 ? "Usá hasta 500 caracteres." : "",
});

export default function FormReview() {
  const navigate = useNavigate();
  const { reviewedUserId } = useParams();
  const form = useRef(null);
  const submitting = useRef(false);
  const [values, setValues] = useState({ title: "", description: "", rating: 0 });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  function change(name, value) {
    const next = { ...values, [name]: value };
    setValues(next);
    setRequestError("");
    if (touched[name] || errors[name]) setErrors((prev) => ({ ...prev, [name]: validate(next)[name] }));
  }
  function blur(name) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(values)[name] }));
  }
  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting.current) return;
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched({ title: true, description: true, rating: true });
    if (Object.values(nextErrors).some(Boolean)) { focusFirstError(form.current, nextErrors); return; }
    if (!Number(reviewedUserId)) { setRequestError("No encontramos a la persona que querés calificar. Volvé a su perfil e intentá otra vez."); return; }
    submitting.current = true;
    setRequestError("");
    setIsSubmitting(true);
    try {
      await api.post("/reviews", { reviewedUserId: Number(reviewedUserId), title: values.title.trim(), description: values.description.trim(), rating: values.rating });
      setSaved(true);
    } catch (error) {
      setRequestError(errorMessage(error, "No pudimos publicar tu reseña. Tu texto sigue acá: intentá nuevamente."));
    } finally { submitting.current = false; setIsSubmitting(false); }
  }

  return (
    <FormPage eyebrow="TU EXPERIENCIA CUENTA" title={saved ? "¡Gracias por tu reseña!" : "¿Cómo fue el canje?"} description={saved ? "Tu opinión ayuda a otras personas a canjear con confianza." : "Compartí tu experiencia de forma respetuosa. Todos los campos son obligatorios."}>
      {saved ? <>
        <FormStatus kind="success">Tu reseña se publicó correctamente.</FormStatus>
        <div className={forms.actions}><button className={forms.primary} type="button" onClick={() => navigate(-1)}>Volver</button></div>
      </> : <form ref={form} onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
        <fieldset className={`${styles.ratingField} ${errors.rating ? styles.invalid : ""}`} aria-describedby={`rating-hint${errors.rating ? " rating-error" : ""}`}>
          <legend>Tu calificación <span aria-hidden="true">*</span></legend>
          <p id="rating-hint" className={forms.help}>Elegí de 1 a 5 estrellas.</p>
          <div className={styles.rating}>
            {[1, 2, 3, 4, 5].map((star) => <label className={styles.starOption} key={star}>
              <input type="radio" name="rating" value={star} checked={values.rating === star} onChange={() => change("rating", star)} onBlur={() => blur("rating")} aria-label={`${star} ${star === 1 ? "estrella" : "estrellas"}: ${ratingLabels[star - 1]}`} aria-invalid={Boolean(errors.rating)} disabled={isSubmitting} />
              <span className={`${styles.star} ${star <= values.rating ? styles.active : ""}`} aria-hidden="true">★</span>
            </label>)}
          </div>
          <p className={styles.ratingLabel}>{values.rating ? ratingLabels[values.rating - 1] : "Todavía no elegiste una calificación"}</p>
          {errors.rating && <p id="rating-error" className={styles.error} role="alert">{errors.rating}</p>}
        </fieldset>
        <div className={styles.fields}>
          <Field id="review-title" label="Título de la reseña" required hint={`${values.title.length}/80 caracteres`} error={errors.title}>
            <input {...fieldProps("review-title", errors.title, true)} className={forms.control} name="title" value={values.title} placeholder="Por ejemplo: un canje fácil y puntual" onChange={(event) => change("title", event.target.value)} onBlur={() => blur("title")} maxLength={80} disabled={isSubmitting} required />
          </Field>
          <Field id="review-description" label="Tu experiencia" required hint={`${values.description.length}/500 caracteres. Evitá compartir teléfonos, direcciones u otros datos personales.`} error={errors.description}>
            <textarea {...fieldProps("review-description", errors.description, true)} className={forms.control} name="description" rows={5} value={values.description} placeholder="¿Cómo fue la comunicación? ¿El producto estaba como lo esperabas?" onChange={(event) => change("description", event.target.value)} onBlur={() => blur("description")} maxLength={500} disabled={isSubmitting} required />
          </Field>
        </div>
        <FormStatus kind="error">{requestError}</FormStatus>
        <div className={forms.actions}>
          <button className={forms.secondary} type="button" onClick={() => navigate(-1)} disabled={isSubmitting}>Cancelar</button>
          <button className={forms.primary} type="submit" disabled={isSubmitting}>{isSubmitting ? "Publicando reseña…" : "Publicar reseña"}</button>
        </div>
      </form>}
    </FormPage>
  );
}
