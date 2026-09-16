import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import styles from "./FormReview.module.css";
import api from "../../api/api";

const FormReview = () => {
  const navigate = useNavigate();
  const { reviewedUserId } = useParams();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!Number(reviewedUserId)) {
      setError("No se encontró el usuario a calificar.");
      return;
    }

    if (!rating) {
      setError("Selecciona una calificación de 1 a 5 estrellas.");
      return;
    }

    if (!titulo.trim() || !descripcion.trim()) {
      setError("Completa el título y la descripción.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await api.post("/reviews", {
        reviewedUserId: Number(reviewedUserId),
        title: titulo.trim(),
        description: descripcion.trim(),
        rating,
      });

      await Swal.fire({
        icon: "success",
        title: "¡Reseña enviada!",
        text: "Tu calificación fue registrada correctamente.",
      });

      navigate(-1);
    } catch (error) {
      const message =
        error.response?.data?.error ||
        "No se pudo enviar la reseña. Inténtalo nuevamente.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.formReview} onSubmit={handleSubmit}>
      <h2>Dejá tu reseña</h2>

      <div className={styles.container}>
        <div className={styles.field}>
          <span className={styles.label}>Calificación</span>

          <div
            className={styles.rating}
            role="radiogroup"
            aria-label="Calificación de 1 a 5 estrellas"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`${styles.star} ${
                  star <= rating ? styles.active : ""
                }`}
                onClick={() => {
                  setRating(star);
                  setError("");
                }}
                aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
                aria-pressed={star === rating}
                disabled={isSubmitting}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="titulo">
            Título
          </label>

          <input
            type="text"
            id="titulo"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            maxLength="80"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="descripcion">
            Descripción
          </label>

          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            maxLength="500"
            disabled={isSubmitting}
            required
          />
        </div>

        {error && <span className={styles.error}>{error}</span>}
      </div>

      <button
        className={styles.submit}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
};

export default FormReview;