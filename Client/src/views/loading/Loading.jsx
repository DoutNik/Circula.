import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import style from "./Loading.module.css";

const Loading = () => {
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (showSpinner) {
    return (
      <div className={style.spinnerContainer} role="status" aria-label="Cargando">
        <div className={style.spinner}>
          <span className={style.bounce1}></span>
          <span className={style.bounce2}></span>
          <span className={style.bounce3}></span>
        </div>
      </div>
    );
  }

  return (
    <main className={style.loading}>
      <img
        src="https://img.icons8.com/emoji/48/warning-emoji.png"
        alt=""
        aria-hidden="true"
      />

      <h3>
        Debes iniciar sesión para acceder a todas las funcionalidades.
      </h3>

      <Link to="/login" className={style.loginButton}>
        Iniciar sesión
      </Link>
    </main>
  );
};

export default Loading;