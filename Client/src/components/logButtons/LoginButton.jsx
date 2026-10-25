import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import api from "../../api/api";
import style from "./LoginButton.module.css";

// Componente reutilizable de acceso con Google. Antes dependía de Clerk, que
// no forma parte de este proyecto ni era el proveedor que valida la API.
const LoginButton = ({ onAuthenticated }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleLogin = async () => {
    try {
      setIsRedirecting(true);
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await result.user.getIdToken();
      const response = await api.post("/users/social-login", { idToken });

      localStorage.setItem("token", response.data.token);
      onAuthenticated?.(true, response.data.usuario);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <div className={style.login}>
      <button
        type="button"
        onClick={handleLogin}
        disabled={isRedirecting}
      >
        <span>{isRedirecting ? "Redirigiendo..." : "Ingresa con"}</span>

        <img
          src="https://img.icons8.com/color/48/google-logo.png"
          alt=""
        />
      </button>
    </div>
  );
};

export default LoginButton;
