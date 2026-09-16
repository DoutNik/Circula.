import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PayModal from "../payModal/PayModal";
import api from "../../api/api";
import style from "./Avatar.module.css";

const DEFAULT_AVATAR =
  "https://img.icons8.com/fluency-systems-regular/96/user.png";

const Avatar = ({ userData, setAuth, toggleDarkMode }) => {
  const [isPremium, setPremium] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("darkMode") === "true",
  );

  const imageUrl = userData?.image || DEFAULT_AVATAR;
  const rating = Math.min(
    5,
    Math.max(0, Math.round(Number(userData?.averageRating) || 0)),
  );

  useEffect(() => {
    if (!userData?.id) {
      setPremium(false);
      return;
    }

    const getPremiumStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/users/userId", {
          headers: { token },
          params: { id: userData.id },
        });

        setPremium(response.data.plan === "premium");
      } catch (error) {
        console.error("Error al obtener la información del usuario:", error);
        setPremium(false);
      }
    };

    getPremiumStatus();
  }, [userData?.id]);

  const logout = () => {
    localStorage.removeItem("token");
    setAuth(false, null);
  };

  const handleThemeToggle = () => {
    const updatedDarkMode = !isDarkMode;

    setIsDarkMode(updatedDarkMode);
    localStorage.setItem("darkMode", String(updatedDarkMode));
    toggleDarkMode?.();
  };

  return (
    <div className={isPremium ? style.avatarPremium : style.avatar}>
      {userData?.rol === "admin" && (
        <Link
          to="/admin"
          className={style.dash}
          aria-label="Ir al panel de administrador"
        >
          <img
            src="https://img.icons8.com/color/48/dashboard.png"
            alt=""
          />
        </Link>
      )}

      <div className={style.imageWrapper}>
        <img
          src={imageUrl}
          alt={`Foto de perfil de ${userData?.username || "usuario"}`}
          className={style.photo}
          referrerPolicy="no-referrer"
        />

        {isPremium && (
          <img
            src="https://img.icons8.com/color/48/guarantee.png"
            alt="Usuario premium"
            className={style.logo}
          />
        )}
      </div>

      <h3>{userData?.username}</h3>
      <p>{userData?.email}</p>

      {rating > 0 ? (
        <div
          className={style.rating}
          aria-label={`Calificación: ${rating} de 5`}
        >
          {Array.from({ length: rating }, (_, index) => (
            <span key={index}>⭐</span>
          ))}
        </div>
      ) : (
        <h4>Todavía nadie te ha calificado.</h4>
      )}

      <div className={style.actions}>
        <button
          type="button"
          className={isDarkMode ? style.dark : style.light}
          onClick={handleThemeToggle}
        >
          {isDarkMode ? "Fondo ☀️" : "Fondo 🌘"}
        </button>

        {!isPremium && (
          <button
            type="button"
            className={style.premium}
            onClick={() => setIsModalOpen(true)}
          >
            Sé premium
          </button>
        )}

        <button type="button" className={style.logout} onClick={logout}>
          Salir
        </button>
      </div>

      <PayModal
        isOpen={isModalOpen}
        userData={userData}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Avatar;