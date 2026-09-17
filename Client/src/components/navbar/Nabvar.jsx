import { Link, useLocation } from "react-router-dom";
import Logo from "../../assets/locan.png";
import style from "./Nabvar.module.css";
import { logoutUser } from "../logButtons/LogoutButton";
import { useClerk } from "@clerk/clerk-react";

const NavBar = ({ isAuthenticated, userData }) => {
  const location = useLocation();
  const { signOut } = useClerk();

  const imageUrl = userData?.image?.split("=")[0];

  return (
    <nav
      className={isAuthenticated ? style.navbar : style.navbarOff}
      aria-label="Navegación principal"
    >
      {/* LOGO */}
      <Link to="/" className={style.linkLogo} aria-label="Ir al inicio">
        <img src={Logo} className={style.logo} alt="Locan" />
      </Link>

      {/* PRINCIPAL */}
      <Link
        to="/"
        className={`${style.link} ${
          location.pathname === "/" ? style.active : ""
        }`}
      >
        <span className={style.iconos}>
          <img
            src="https://img.icons8.com/fluency-systems-regular/48/home--v1.png"
            alt=""
            aria-hidden="true"
          />
          <span className={style.label}>Principal</span>
        </span>
      </Link>

      {/* AGREGAR */}
      {isAuthenticated ? (
        <Link
          to="/addProduct"
          className={`${style.link} ${
            location.pathname === "/addProduct" ? style.active : ""
          }`}
        >
          <span className={style.iconos}>
            <img
              src="https://img.icons8.com/sf-regular/48/add.png"
              alt=""
              aria-hidden="true"
            />
            <span className={style.label}>Agregar</span>
          </span>
        </Link>
      ) : (
        <Link to="/addProduct" className={style.link}>
          <span className={style.iconosFalse}>
            <img
              src="https://img.icons8.com/sf-regular/48/add.png"
              alt=""
              aria-hidden="true"
            />
            <span className={style.lock}>🔐</span>
          </span>
        </Link>
      )}

      {/* CANJES */}
      {isAuthenticated ? (
        <Link
          to="/exchanges"
          className={`${style.link} ${
            location.pathname === "/exchanges" ? style.active : ""
          }`}
        >
          <span className={style.iconos}>
            <img
              src="https://img.icons8.com/material-rounded/48/available-updates.png"
              alt=""
              aria-hidden="true"
            />
            <span className={style.label}>Canjes</span>
          </span>
        </Link>
      ) : (
        <Link to="/exchanges" className={style.link}>
          <span className={style.iconosFalse}>
            <img
              src="https://img.icons8.com/material-rounded/48/available-updates.png"
              alt=""
              aria-hidden="true"
            />
            <span className={style.lock}>🔐</span>
          </span>
        </Link>
      )}

      {/* MENSAJES */}
      {isAuthenticated ? (
        <Link
          to="/messages"
          className={`${style.link} ${
            location.pathname === "/messages" ? style.active : ""
          }`}
        >
          <span className={style.iconos}>
            <img
              src="https://img.icons8.com/fluency-systems-regular/48/chat--v1.png"
              alt=""
              aria-hidden="true"
            />
            <span className={style.label}>Mensajes</span>
          </span>
        </Link>
      ) : (
        <Link to="/messages" className={style.link}>
          <span className={style.iconosFalse}>
            <img
              src="https://img.icons8.com/fluency-systems-regular/48/chat--v1.png"
              alt=""
              aria-hidden="true"
            />
            <span className={style.lock}>🔐</span>
          </span>
        </Link>
      )}

      {/* PERFIL / LOGIN */}
      <Link
        to={isAuthenticated ? "/profile" : "/login"}
        className={`${style.link} ${
          location.pathname === (isAuthenticated ? "/profile" : "/login")
            ? style.active
            : ""
        }`}
      >
        {isAuthenticated ? (
          <span className={style.iconos}>
            <img
              src={imageUrl || "/placeholder.png"}
              alt=""
              className={style.avatar}
              referrerPolicy="no-referrer"
            />

            <span className={style.label}>
              {userData?.username || "Perfil"}
            </span>
          </span>
        ) : (
          <span className={style.iconos}>
            <img
              src="https://img.icons8.com/?size=100&id=9ZgJRZwEc5Yj&format=png&color=000000"
              alt=""
              aria-hidden="true"
            />
            <span className={style.label}>Iniciar sesión</span>
          </span>
        )}
      </Link>

      {/* LOGOUT */}
      {isAuthenticated && (
        <button
          type="button"
          className={style.logout}
          onClick={() => logoutUser(signOut)}
          aria-label="Cerrar sesión"
        >
          <img
            src="https://img.icons8.com/fluency-systems-filled/48/exit.png"
            alt=""
            aria-hidden="true"
          />
          <span className={style.label}>Salir</span>
        </button>
      )}
    </nav>
  );
};

export default NavBar;
