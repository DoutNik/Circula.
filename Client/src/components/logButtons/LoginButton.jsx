import { useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import style from "./LoginButton.module.css";

const LoginButton = () => {
  const { signInWithRedirect } = useClerk();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleLogin = async () => {
    try {
      setIsRedirecting(true);

      await signInWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/",
      });
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
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