import { useState } from "react";
import style from "./Footer.module.css";

const Footer = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <footer>
      <button
        type="button"
        className={style.toggle}
        onClick={() => setIsCollapsed((current) => !current)}
        aria-expanded={!isCollapsed}
        aria-controls="footer-content"
        aria-label={isCollapsed ? "Expandir pie de página" : "Ocultar pie de página"}
      >
        <img
          src={
            isCollapsed
              ? "https://img.icons8.com/color/48/expand-arrow.png"
              : "https://img.icons8.com/color/48/collapse-arrow.png"
          }
          alt=""
        />
      </button>

      <div
        id="footer-content"
        className={`${style.footer} ${isCollapsed ? style.collapsed : ""}`}
      >
        <section className={style.left}>
          <h3>Acerca de</h3>
          <p>Términos y condiciones</p>
          <p>Nosotros</p>
        </section>

        <section className={style.right}>
          <h3>Contacto</h3>

          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://img.icons8.com/color-glass/48/instagram-new--v1.png"
              alt=""
            />
            Instagram
          </a>

          <a href="mailto:correo@ejemplo.com">
            <img
              src="https://img.icons8.com/color/48/apple-mail.png"
              alt=""
            />
            Centro de ayuda
          </a>
        </section>

        <section className={style.center}>
          <h3>Desarrollada por</h3>

          <div className={style.ab}>
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