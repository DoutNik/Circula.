import { useState } from "react";
import { Link } from "react-router-dom";
import style from "./Login.module.css";

import {
  GoogleAuthProvider,
  signInWithCustomToken,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../../firebase.js";
import api from "../../api/api.js";
import Swal from "sweetalert2";

import Logo from "../../assets/locan.png";

const validateLogin = (username, password) => {
  const errors = {};

  if (!username.trim()) {
    errors.username = "Por favor, ingrese un usuario válido";
  }

  if (!password) {
    errors.password = "La contraseña es incorrecta";
  }

  return errors;
};

const Login = ({ setAuth }) => {
  const [input, setInput] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateLogin(input.username, input.password);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});

      const response = await api.post("/users/login", {
        username: input.username.trim(),
        password: input.password,
      });

      const { token, firebaseToken, usuario } = response.data;

      if (!token || !firebaseToken) {
        setErrors({
          general: "Usuario o contraseña incorrectos",
        });
        return;
      }

      // JWT propio de la aplicación
      localStorage.setItem("token", token);

      // Firebase mediante Custom Token
      await signInWithCustomToken(auth, firebaseToken);

      // Actualizamos autenticación global
      setAuth(true, usuario);

      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Login exitoso",
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);

      setErrors({
        general: "Usuario o contraseña incorrectos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setSocialLoading("google");

      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await api.post("/users/social-login", {
        idToken,
      });

      localStorage.setItem("token", response.data.token);

      setAuth(true, response.data.usuario);

      await Swal.fire({
        icon: "success",
        title: "Login exitoso",
        text: `¡Bienvenido ${response.data.usuario.username || "de nuevo"}!`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error Google login:", error);

      if (error.code === "auth/popup-closed-by-user") {
        return;
      }

      if (error.code === "auth/account-exists-with-different-credential") {
        Swal.fire({
          icon: "warning",
          title: "Cuenta existente",
          text: "Ya existe una cuenta con este email utilizando otro método de acceso.",
        });

        return;
      }

      Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: "No se pudo autenticar con Google.",
      });
    } finally {
      setSocialLoading("");
    }
  };

  const isAnyLoading = isLoading || Boolean(socialLoading);

  return (
    <main className={style.container}>
      <img className={style.logo} src={Logo} alt="Circula" />

      <h1>Iniciar sesión</h1>

      <form className={style.form} onSubmit={handleSubmit} noValidate>
        <div className={style.field}>
          <label htmlFor="username">Usuario</label>

          <input
            id="username"
            type="text"
            name="username"
            placeholder="Usuario"
            value={input.username}
            onChange={handleInputChange}
            autoComplete="username"
            disabled={isAnyLoading}
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? "username-error" : undefined}
          />

          {errors.username && (
            <span id="username-error" className={style.fieldError}>
              {errors.username}
            </span>
          )}
        </div>

        <div className={style.field}>
          <label htmlFor="password">Contraseña</label>

          <input
            id="password"
            type="password"
            name="password"
            placeholder="Contraseña"
            value={input.password}
            onChange={handleInputChange}
            autoComplete="current-password"
            disabled={isAnyLoading}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />

          {errors.password && (
            <span id="password-error" className={style.fieldError}>
              {errors.password}
            </span>
          )}
        </div>

        {errors.general && (
          <div className={style.error} role="alert">
            {errors.general}
          </div>
        )}

        <button
          type="submit"
          className={style.loginButton}
          disabled={isAnyLoading}
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>

      <div className={style.registerSection}>
        <span>¿No tienes una cuenta?</span>

        <Link to="/register" className={style.register}>
          Regístrate
        </Link>
      </div>

      <div className={style.divider}>
        <span>o</span>
      </div>

      <button
        type="button"
        className={style.googleButton}
        onClick={handleGoogleLogin}
        disabled={isAnyLoading}
      >
        {socialLoading === "google" ? (
          "Conectando..."
        ) : (
          <>
            Iniciar sesión con Google
            <img
              src="https://img.icons8.com/color/48/google-logo.png"
              alt=""
              className={style.googleIcon}
            />
          </>
        )}
      </button>

      {/*       <button
        type="button"
        className={style.facebookButton}
        onClick={handleFacebookLogin}
        disabled={isAnyLoading}
      >
        {socialLoading === "facebook"
          ? "Conectando..."
          : "Iniciar sesión con Facebook"}
      </button> */}

      <div className={style.recover}>
        <span>¿Olvidaste la contraseña?</span>

        <Link to="/forgotpassword" className={style.recoverLink}>
          Recuperar contraseña
        </Link>
      </div>
    </main>
  );
};

export default Login;
