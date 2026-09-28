import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import style from "./Exchanges.module.css";

import PostsLiked from "../../components/likedPosts/PostsLiked";
import Matchs from "../../components/matchs/Matchs";
import Header from "../../components/header/Header";
import RecivedLikes from "../../components/recivedLikes/recivedLikes";

import api from "../../api/api";

const BANNER_1 =
  "https://res.cloudinary.com/dlahgnpwp/image/upload/v1699885578/emailAssets/itncfxbtlnpm7e6tsffu.jpg";

const BANNER_2 =
  "https://res.cloudinary.com/dlahgnpwp/image/upload/v1699885577/emailAssets/pql2ueup71odoj5lm7wk.jpg";

const Exchanges = ({ userData }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [loadingPremium, setLoadingPremium] = useState(true);

  useEffect(() => {
    if (!userData?.id) {
      setLoadingPremium(false);
      return;
    }

    const checkPremium = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data } = await api.get("/users/userId", {
          headers: {
            token,
          },
          params: {
            id: userData.id,
          },
        });

        setIsPremium(data?.plan === "premium");
      } catch (error) {
        console.error(
          "Error al obtener la información del usuario:",
          error
        );

        setIsPremium(false);
      } finally {
        setLoadingPremium(false);
      }
    };

    checkPremium();
  }, [userData?.id]);

  const animationProps = {
    initial: {
      opacity: 0,
      y: 25,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    transition: {
      duration: 0.35,
    },
  };

  return (
    <>
      <Header
        banner1={BANNER_1}
        banner2={BANNER_2}
      />

      <main className={style.exchanges}>
        {/* PEDIDOS DE CANJE */}
        <motion.section
          {...animationProps}
          transition={{
            ...animationProps.transition,
            delay: 0,
          }}
          className={`${style.card} ${style.requests}`}
        >
          <h2>Pedidos de canje</h2>

          {loadingPremium ? (
            <div className={style.alert}>
              <p>Cargando...</p>
            </div>
          ) : isPremium ? (
            <RecivedLikes userData={userData} />
          ) : (
            <div className={style.alert}>
              <p>
                Para acceder a esta funcionalidad
                debes ser Premium.
              </p>
            </div>
          )}
        </motion.section>

        {/* CANJES LOGRADOS */}
        <motion.section
          {...animationProps}
          transition={{
            ...animationProps.transition,
            delay: 0.1,
          }}
          className={`${style.card} ${style.matchs}`}
        >
          <h2>Canjes logrados</h2>

          <Matchs userData={userData} />
        </motion.section>

        {/* MIS INTENTOS */}
        <motion.section
          {...animationProps}
          transition={{
            ...animationProps.transition,
            delay: 0.2,
          }}
          className={`${style.card} ${style.likes}`}
        >
          <h2>Mis intentos de canje</h2>

          <PostsLiked userData={userData} />
        </motion.section>
      </main>
    </>
  );
};

export default Exchanges;