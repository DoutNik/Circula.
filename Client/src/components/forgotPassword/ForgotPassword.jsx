import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import style from "./ForgotPassword.module.css";
import api from "../../api/api";

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("El email es obligatorio.");
      return;
    }

    if (!validateEmail(email.trim())) {
      setError("Ingrese un email válido.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await api.post("/users/forgot-password", {
        email: email.trim(),
      });

      await Swal.fire({
        icon: "success",
        title: "Solicitud enviada",
        text: "Si el email está registrado, recibirá un link.",
      });

      navigate("/login");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un problema. Intente nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={style.container}>
      <form className={style.form} onSubmit={handleSubmit}>
        <div className={style.textContainer}>
          <h1 className={style.title}>Recuperar contraseña</h1>
          <p>Te enviaremos un enlace para restablecerla.</p>
        </div>

        <div className={style.inputContainer}>
          <label className={style.label} htmlFor="email">
            Ingrese su email
          </label>

          <input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={style.input}
            autoComplete="email"
            disabled={isSubmitting}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "email-error" : undefined}
          />

          {error && (
            <span id="email-error" className={style.error}>
              {error}
            </span>
          )}
        </div>

        <div className={style.buttonContainer}>
          <button
            type="submit"
            className={style.button}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>

          <p className={style.registerLink}>¿No tiene una cuenta?</p>

          <Link to="/register" className={style.btnAqui}>
            Regístrate
          </Link>
        </div>
      </form>
    </main>
  );
};

export default ForgotPassword;