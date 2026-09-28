import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Avatar from "../../components/avatar/Avatar";
import Publication from "../../components/publication/Publication";
import Header from "../../components/header/Header";
import style from "./MyProfile.module.css";
import api from "../../api/api";
import Swal from "sweetalert2";
import { handlePremiumPurchase } from "../../services/paymentService";

const BANNER_1 =
  "https://res.cloudinary.com/dlahgnpwp/image/upload/v1699885578/emailAssets/itncfxbtlnpm7e6tsffu.jpg";

const BANNER_2 =
  "https://res.cloudinary.com/dlahgnpwp/image/upload/v1699885577/emailAssets/pql2ueup71odoj5lm7wk.jpg";

const MyProfile = ({ userData, setAuth, toggleDarkMode }) => {
  const navigate = useNavigate();

  const [isPremium, setPremium] = useState(null);
  const [postCount, setPostCount] = useState(0);

  const getPostCount = useCallback(async () => {
    if (!userData?.id) return;

    try {
      const response = await api.get(
        `/posts/userPosts/${userData.id}`
      );

      setPostCount(
        Array.isArray(response.data)
          ? response.data.length
          : 0
      );
    } catch (error) {
      console.error(
        "Error al obtener posteos:",
        error
      );
    }
  }, [userData?.id]);

  const getPremiumStatus = useCallback(async () => {
    if (!userData?.id) return;

    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/users/userId", {
        headers: {
          token,
        },
        params: {
          id: userData.id,
        },
      });

      setPremium(response?.data?.plan === "premium");
    } catch (error) {
      console.error(
        "Error al obtener la información del usuario:",
        error
      );

      setPremium(false);
    }
  }, [userData?.id]);

  useEffect(() => {
    if (!userData?.id) return;

    getPremiumStatus();
    getPostCount();
  }, [
    userData?.id,
    getPremiumStatus,
    getPostCount,
  ]);

  const handleAddClick = async () => {
    if (postCount >= 3 && !isPremium) {
      await Swal.fire({
        title: "🚫 Límite alcanzado",
        text: "Solo los usuarios premium pueden tener más de 3 publicaciones.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "💎 Hacerse Premium",
        cancelButtonText: "Cancelar",
        showLoaderOnConfirm: true,

        preConfirm: async () => {
          try {
            await handlePremiumPurchase(userData.id);
          } catch (error) {
            console.error(
              "Error al iniciar el pago:",
              error
            );

            Swal.showValidationMessage(
              "Error al iniciar el pago"
            );
          }
        },

        allowOutsideClick: () => !Swal.isLoading(),
      });

      return;
    }

    navigate("/addProduct");
  };

  return (
    <>
      <Header
        banner1={BANNER_1}
        banner2={BANNER_2}
      />

      <motion.main
        initial={{
          opacity: 0,
          y: 30,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
        }}
        className={style.myProfile}
      >
        <section className={style.avatar}>
          <Avatar
            userData={userData}
            setAuth={setAuth}
            toggleDarkMode={toggleDarkMode}
          />
        </section>

        <section className={style.publications}>
          <div className={style.publicationHeader}>
            <h2>Publicaciones</h2>

            <button
              type="button"
              className={style.agregar}
              onClick={handleAddClick}
            >
              Agregar
            </button>
          </div>

          {isPremium === false && (
            <p className={style.postLimit}>
              {postCount}/3 publicaciones usadas
            </p>
          )}

          <Publication
            userData={userData}
            onPostDeleted={getPostCount}
          />
        </section>
      </motion.main>
    </>
  );
};

export default MyProfile;