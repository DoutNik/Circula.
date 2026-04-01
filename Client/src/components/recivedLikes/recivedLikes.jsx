import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import style from "./recivedLikes.module.css";
import api from "../../api/api";

const RecivedLikes = ({ userData }) => {
  const userId = userData.id;

  const [exchangeRequests, setExchangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await api.get(
          `/likes/getLikesRecibidos/${userId}`
        );

        const requests = await Promise.all(
          res.data.map(async (like) => {
            const [myPostRes, anotherPostRes] =
              await Promise.all([
                api.get(`/posts/${like.likedPostId}`), // tu producto
                api.get(`/posts/${like.myPostId}`),    // producto del otro
              ]);

            return {
              myPost: myPostRes.data,
              anotherPost: anotherPostRes.data,
            };
          })
        );

        setExchangeRequests(requests);
      } catch (error) {
        console.error("Error cargando likes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [userId]);

  // 🔄 Loading
  if (loading) {
    return (
      <div className={style.state}>
        <p>Cargando solicitudes...</p>
      </div>
    );
  }

  // 😢 Empty state
  if (exchangeRequests.length === 0) {
    return (
      <div className={style.state}>
        <p>No has recibido solicitudes todavía</p>
      </div>
    );
  }

  return (
    <div className={style.container}>
      {exchangeRequests.map((req, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={style.card}
        >
          <div className={style.like}>
            
            {/* Producto que QUIEREN (tuyo) */}
            <img
              src={req.myPost?.image?.[0]}
              alt={req.myPost?.title}
              className={style.myProduct}
            />

            {/* Info central */}
            <div className={style.info}>
              <p className={style.label}>Quieren tu</p>
              <h4>{req.myPost?.title}</h4>

              <span className={style.arrow}>⇄</span>

              <p className={style.label}>Te ofrecen</p>
              <h4>{req.anotherPost?.title}</h4>
            </div>

            {/* Producto que ofrecen */}
            <img
              src={req.anotherPost?.image?.[0]}
              alt={req.anotherPost?.title}
              className={style.otherProduct}
            />
          </div>

          {/* 🔥 Acciones futuras */}
          <div className={style.actions}>
            <button className={style.accept}>Aceptar</button>
            <button className={style.reject}>Rechazar</button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RecivedLikes;