import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../../assets/locan.png";
import style from "./Nabvar.module.css";
import { logoutUser } from "../logButtons/LogoutButton";

const Icon = ({ kind }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {kind === "home" ? (
      <>
        <path d="m3 10 9-7 9 7v10H3Z" />
        <path d="M9 20v-7h6v7" />
      </>
    ) : kind === "box" ? (
      <>
        <path d="m3 7 9-4 9 4v10l-9 4-9-4Z" />
        <path d="m3 7 9 5 9-5M12 12v9M7 5l10 5" />
      </>
    ) : (
      <>
        <path d="M21 11a8 8 0 0 1-8 8H6l-4 3 1-7a8 8 0 1 1 18-4Z" />
        <path d="M7 11h10" />
      </>
    )}
  </svg>
);

export default function NavBar({ isAuthenticated, userData }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const root = useRef(null);
  const productsButton = useRef(null);
  const profileButton = useRef(null);
  useEffect(() => setOpen(null), [location.pathname]);
  useEffect(() => {
    const outside = (event) => {
      if (!root.current?.contains(event.target)) setOpen(null);
    };
    const escape = (event) => {
      if (event.key === "Escape" && open) {
        setOpen(null);
        (open === "products" ? productsButton : profileButton).current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  const handleLogout = async () => {
    await logoutUser();
    navigate("/login", { replace: true });
    window.location.reload();
  };
  const toggle = (name) => setOpen(open === name ? null : name);
  return (
    <nav
      className={style.navbar}
      aria-label="Navegación principal"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(null);
      }}
    >
      <div className={style.inner}>
        <Link to="/" className={style.brand} aria-label="Circula, inicio">
          <img src={Logo} alt="Circula" />
        </Link>
        <Link
          to="/"
          className={style.item}
          aria-current={location.pathname === "/" ? "page" : undefined}
        >
          <Icon kind="home" />
          <span>Inicio</span>
        </Link>
        <div className={style.dropdown}>
          <button
            ref={productsButton}
            type="button"
            className={style.item}
            aria-expanded={open === "products"}
            aria-controls="products-navigation"
            onClick={() => toggle("products")}
          >
            <Icon kind="box" />
            <span>Productos</span>
            <span className={style.chevron}>⌄</span>
          </button>
          {open === "products" && (
            <div id="products-navigation" className={style.panel}>
              <p>DALE OTRA VIDA</p>
              <Link to="/addProduct" onClick={() => setOpen(null)}>
                Agregar un producto <span>Publicá lo que ya no usás</span>
              </Link>
              <Link to="/exchanges" onClick={() => setOpen(null)}>
                Mis canjes <span>Propuestas y encuentros</span>
              </Link>
            </div>
          )}
        </div>
        <Link
          to="/messages"
          className={style.item}
          aria-label="Mensajes"
          title="Mensajes"
          aria-current={location.pathname === "/messages" ? "page" : undefined}
        >
          <Icon kind="chat" />
        </Link>
        {isAuthenticated ? (
          <div className={style.dropdown}>
            <button
              ref={profileButton}
              type="button"
              className={style.item}
              aria-expanded={open === "profile"}
              aria-controls="profile-navigation"
              onClick={() => toggle("profile")}
            >
              {userData?.image ? (
                <img
                  className={style.avatar}
                  src={userData.image}
                  alt=""
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className={style.initial}>
                  {(userData?.username || "P")[0].toUpperCase()}
                </span>
              )}
              <span className={style.username}>
                {userData?.username || "Mi perfil"}
              </span>
              <span className={style.chevron}>⌄</span>
            </button>
            {open === "profile" && (
              <div id="profile-navigation" className={style.panel}>
                <p>TU ESPACIO</p>
                <Link to="/profile" onClick={() => setOpen(null)}>
                  Mi perfil <span>Mis publicaciones y mi cuenta</span>
                </Link>
                <button
                  type="button"
                  className={style.signout}
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className={style.item}>
            Ingresar
          </Link>
        )}
      </div>
    </nav>
  );
}
