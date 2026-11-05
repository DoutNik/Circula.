import { useState } from "react";
import { Link } from "react-router-dom";
import style from "./Footer.module.css";

const Footer = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <footer className={style.shell}>
      <div className={style.masthead}><div><strong>Circula</strong><p>Comunidad de canje</p></div>
      <button
        type="button"
        className={style.toggle}
        onClick={() => setIsCollapsed((current) => !current)}
        aria-expanded={!isCollapsed}
        aria-controls="footer-content"
        aria-label={
          isCollapsed ? "Expandir pie de página" : "Ocultar pie de página"
        }
      >
        {isCollapsed ? "Ver enlaces" : "Ocultar enlaces"} <span aria-hidden="true">{isCollapsed ? "＋" : "−"}</span>
      </button></div>

      <div
        id="footer-content"
        className={style.footer}
        hidden={isCollapsed}
      >
        <section>
          <h3>Acerca de</h3>
          <Link to="/terminos-y-condiciones">Términos y condiciones</Link>
          <Link to="/privacidad">Política de privacidad</Link>
          <Link to="/eliminar-cuenta">Eliminar cuenta</Link>
          <Link to="/nosotros">Nosotros</Link>
        </section>

        <section>
          <h3>Contacto</h3>

          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
            Instagram
          </a>

          <a href="mailto:carlosklema@hotmail.com">
            Email de ayuda
          </a>
        </section>

        <section>
          <h3>Desarrollada por</h3>

          <div>
            <a
              href="https://github.com/DoutNik"
              target="_blank"
              rel="noreferrer"
            >
              Carlos Emanuel Klema
            </a>

            <a
              href="https://github.com/maxivalli"
              target="_blank"
              rel="noreferrer"
            >
              Maximiliano Valli
            </a>
          </div>
        </section>
      </div>

      <div className={style.bottom}>
        <p>Circula© - Todos los derechos registrados - 2026</p>
      </div>
    </footer>
  );
};

export default Footer;
