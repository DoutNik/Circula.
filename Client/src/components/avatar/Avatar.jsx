/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import style from "./Avatar.module.css";
import PayModal from "../payModal/PayModal";
import api from "../../api/api";

const Avatar = ({ userData, setAuth, toggleDarkMode }) => {
  const [isPremium, setPremium] = useState(false);
  const imageUrl = userData.image.split("=")[0];
  const premium = async () => {
    try {
      const token = localStorage.getItem("token");
      const usuario = await api.get("/users/userId", {
        headers: {
          token: token,
        },
        params: { id: userData.id },
      });

      if (usuario.data.plan === "premium") {
        setPremium(true);
      }
    } catch (error) {
      console.error("Error al obtener la información del usuario:", error);
    }
  };

  useEffect(() => {
    if (userData?.id) {
      premium();
    }
  }, [userData]);

  const logout = () => {
    localStorage.removeItem("token");
    setAuth(false);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const initialDarkMode = localStorage.getItem("darkMode") === "true";
  const [isDarkMode, setIsDarkMode] = useState(initialDarkMode);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleThemeToggle = () => {
    const updatedDarkMode = !isDarkMode;
    setIsDarkMode(updatedDarkMode);
    toggleDarkMode();
    localStorage.setItem("darkMode", updatedDarkMode);
  };

  return (
    <>
      <div className={isPremium ? style.avatarPremium : style.avatar}>
        {userData.rol === "admin" && (
          <Link to="/admin">
            <button className={style.dash}>
              <img
                width="30"
                height="30"
                src="https://img.icons8.com/color/48/dashboard.png"
                alt="dashboard"
              />
            </button>
          </Link>
        )}

        <img
          src={imageUrl}
          alt="Foto de perfil"
          className={style.photo}
          referrerPolicy="no-referrer"
        />
        {isPremium && (
          <img
            width="36"
            height="36"
            src="https://img.icons8.com/color/48/guarantee.png"
            alt="guarantee"
            className={style.logo}
          />
        )}
        <h3>{userData.username}</h3>
        <p>{userData.email}</p>
        {userData.averageRating ? (
          <div>
            {Array.from({ length: userData.averageRating }, (_, index) => (
              <span key={index}>⭐️</span>
            ))}
          </div>
        ) : (
          <h4>Todavía nadie te ha calificado.</h4>
        )}

        <button
          className={isDarkMode ? style.dark : style.light}
          onClick={handleThemeToggle}
        >
          {isDarkMode ? "Fondo☀️" : "Fondo🌘"}
        </button>

        <br />

        <button
          className={style.premium}
          onClick={openModal}
          disabled={isPremium}
        >
          {isPremium ? "¡Gracias!" : "Sé premium"}
        </button>

        <br />
        <br />

        <div>
          {!userData && (
            <button className={style.logout} onClick={logout}>
              Salir
            </button>
          )}
        </div>

        <PayModal
          isOpen={isModalOpen}
          userData={userData}
          onClose={closeModal}
        />
      </div>
    </>
  );
};

export default Avatar;
