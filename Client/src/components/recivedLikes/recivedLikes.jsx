import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import style from "./recivedLikes.module.css";

import {
  fetchReceivedLikes,
  respondLike,
} from "../../redux/actions";

const RecivedLikes = ({ userData }) => {
  const dispatch = useDispatch();
  const userId = userData.id;

  const exchangeRequests = useSelector(
    (state) => state.receivedLikes
  );
  const loading = useSelector(
    (state) => state.loadingLikes
  );

  useEffect(() => {
    dispatch(fetchReceivedLikes(userId));
  }, [dispatch, userId]);

  const showSafetyModal = () => {
    Swal.fire({
      title: "⚠️ Intercambio seguro",
      html: `
        <ul style="text-align:left">
          <li>✔ Lugares públicos</li>
          <li>✔ Revisar productos</li>
          <li>✔ No entregar sin recibir</li>
          <li>✔ Evitar zonas peligrosas</li>
          <li>✔ Ir acompañado</li>
        </ul>
      `,
    });
  };

  const handleRespond = async (likeId, action, req) => {
    try {
      const confirm = await Swal.fire({
        title:
          action === "accepted"
            ? "¿Aceptar canje?"
            : "¿Rechazar canje?",
        text:
          action === "accepted"
            ? `${req.myPost.title} ⇄ ${req.anotherPost.title}`
            : "Esta acción no se puede deshacer",
        icon: action === "accepted" ? "question" : "warning",
        showCancelButton: true,
      });

      if (!confirm.isConfirmed) return;

      const result = await dispatch(
        respondLike(likeId, action)
      );

      if (!result?.success) throw new Error();

      if (action === "accepted") {
        await Swal.fire(
          "¡Canje aceptado!",
          "Se creó un chat para coordinar",
          "success"
        );

        showSafetyModal();
      } else {
        Swal.fire("Canje rechazado", "", "info");
      }
    } catch (error) {
      Swal.fire(
        "Error",
        "No se pudo procesar la solicitud",
        "error"
      );
    }
  };

  if (loading) {
    return <p>Cargando solicitudes...</p>;
  }

  if (!exchangeRequests.length) {
    return <p>No hay solicitudes</p>;
  }
  console.log(exchangeRequests);
  

  return (
    <div className={style.container}>
      {exchangeRequests.map((req, index) => (
        <motion.div
          key={req.id}
          className={style.card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={style.like}>
            <img src={req.myPost.image[0]} />

            <div className={style.info}>
              <h4>{req.myPost.title}</h4>
              <span>⇄</span>
              <h4>{req.anotherPost.title}</h4>
            </div>

            <img src={req.anotherPost.image[0]} />
          </div>

          <div className={style.actions}>
            <button
              onClick={() =>
                handleRespond(req.id, "accepted", req)
              }
            >
              Aceptar
            </button>

            <button
              onClick={() =>
                handleRespond(req.id, "rejected", req)
              }
            >
              Rechazar
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RecivedLikes;