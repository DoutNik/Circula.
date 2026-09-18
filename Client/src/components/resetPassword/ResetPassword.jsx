import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams, Link } from "react-router-dom";
import style from "./ResetPassword.module.css";
import api from "../../api/api";
import { validatePassw, validateRepeat } from "./validate";
import Swal from "sweetalert2";
const ResetPassword = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [input, setInput] = useState({ password: "", passwordRepeat: "" });
  const [error, setError] = useState({ password: null, passwordRepeat: null });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    if (name === "password") {
      setError((prev) => ({
        ...prev,
        password: validatePassw(value),
        /* También actualizamos la confirmación porque puede dejar de coincidir cuando cambia la contraseña. */ passwordRepeat:
          input.passwordRepeat !== ""
            ? validateRepeat(input.passwordRepeat, value)
            : null,
      }));
    }
    if (name === "passwordRepeat") {
      setError((prev) => ({
        ...prev,
        passwordRepeat: validateRepeat(value, input.password),
      }));
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const passwordError = validatePassw(input.password);
    const passwordRepeatError = validateRepeat(
      input.passwordRepeat,
      input.password,
    );
    setError({ password: passwordError, passwordRepeat: passwordRepeatError });
    if (passwordError || passwordRepeatError) {
      return;
    }
    try {
      setLoading(true);
      const response = await api.post(`/users/reset-password/${id}`, {
        password: input.password,
      });
      if (response?.data) {
        await Swal.fire({
          icon: "success",
          title: "Contraseña actualizada",
          text: "¡Iniciá sesión con tu nueva contraseña!",
          confirmButtonText: "Continuar",
        });
        navigate("/login");
      }
    } catch (err) {
      console.error("Error al restablecer la contraseña:", err);
      const backendMessage =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || err.response?.data?.error;
      Swal.fire({
        icon: "error",
        title: "No se pudo cambiar la contraseña",
        text: backendMessage || "Ocurrió un error. Intentá nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  const isSubmitDisabled =
    loading ||
    !input.password ||
    !input.passwordRepeat ||
    Boolean(error.password) ||
    Boolean(error.passwordRepeat);
  return (
    <div className={style.page}>
      {" "}
      <motion.div
        className={`${style.container} ${style.bgColor}`}
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {" "}
        <form onSubmit={handleSubmit} className={style.form}>
          {" "}
          {/* TÍTULO */}{" "}
          <div className={style.textContainer}>
            {" "}
            <h1 className={style.title}> Cambiar contraseña </h1>{" "}
            <p className={style.description}>
              {" "}
              Ingresá tu nueva contraseña y repetila para confirmar.{" "}
            </p>{" "}
          </div>{" "}
          {/* CAMPOS */}{" "}
          <div className={style.inputContainer}>
            {" "}
            {/* NUEVA CONTRASEÑA */}{" "}
            <div className={style.field}>
              {" "}
              <label htmlFor="password" className={style.label}>
                {" "}
                Nueva contraseña:{" "}
              </label>{" "}
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Contraseña"
                value={input.password}
                onChange={handleChange}
                className={style.input}
                disabled={loading}
                autoComplete="new-password"
              />{" "}
              {error.password && (
                <span className={style.error}> {error.password} </span>
              )}{" "}
            </div>{" "}
            {/* REPETIR CONTRASEÑA */}{" "}
            <div className={style.field}>
              {" "}
              <label htmlFor="passwordRepeat" className={style.label}>
                {" "}
                Repetir contraseña:{" "}
              </label>{" "}
              <input
                id="passwordRepeat"
                type={showPassword ? "text" : "password"}
                name="passwordRepeat"
                placeholder="Repetir contraseña"
                value={input.passwordRepeat}
                onChange={handleChange}
                className={style.segundoInput}
                disabled={loading}
                autoComplete="new-password"
              />{" "}
              {error.passwordRepeat && (
                <span className={style.error}> {error.passwordRepeat} </span>
              )}{" "}
            </div>{" "}
            {/* MOSTRAR CONTRASEÑA */}{" "}
            <label
              htmlFor="showPassword"
              className={style.showPasswordContainer}
            >
              {" "}
              <input
                type="checkbox"
                id="showPassword"
                onChange={handleShowPassword}
                checked={showPassword}
                disabled={loading}
                className={style.checkbox}
              />{" "}
              <span>Ver contraseñas</span>{" "}
            </label>{" "}
          </div>{" "}
          {/* BOTONES */}{" "}
          <div className={style.buttonContainer}>
            {" "}
            <button
              type="submit"
              className={`${style.button} ${isSubmitDisabled ? style.buttonDisabled : ""}`}
              disabled={isSubmitDisabled}
            >
              {" "}
              {loading ? "Enviando..." : "Enviar"}{" "}
            </button>{" "}
            <div className={style.registerLink}> ¿No tenés una cuenta? </div>{" "}
            <Link to="/register" className={style.registerLinkButton}>
              {" "}
              Registrate{" "}
            </Link>{" "}
          </div>{" "}
        </form>{" "}
      </motion.div>{" "}
    </div>
  );
};
export default ResetPassword;
