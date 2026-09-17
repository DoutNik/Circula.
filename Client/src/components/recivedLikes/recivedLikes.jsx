import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import style from "./recivedLikes.module.css";
import { fetchReceivedLikes, respondLike } from "../../redux/actions";
const RecivedLikes = ({ userData }) => {
  const dispatch = useDispatch();
  const userId = userData?.id;
  const exchangeRequests = useSelector((state) => state.receivedLikes);
  const loading = useSelector((state) => state.loadingLikes);
  useEffect(() => {
    if (userId) {
      dispatch(fetchReceivedLikes(userId));
    }
  }, [dispatch, userId]);
  const showSafetyModal = () => {
    Swal.fire({
      title: "⚠️ Intercambio seguro",
      html: ` <ul style="text-align:left"> <li>✔ Lugares públicos</li> <li>✔ Revisar productos</li> <li>✔ No entregar sin recibir</li> <li>✔ Evitar zonas peligrosas</li> <li>✔ Ir acompañado</li> </ul> `,
      confirmButtonText: "Entendido",
    });
  };
  const handleRespond = async (likeId, action, req) => {
    try {
      const confirm = await Swal.fire({
        title: action === "accepted" ? "¿Aceptar canje?" : "¿Rechazar canje?",
        text:
          action === "accepted"
            ? `${req.myPost?.title || "Producto"} ⇄ ${req.anotherPost?.title || "Producto"}`
            : "Esta acción no se puede deshacer",
        icon: action === "accepted" ? "question" : "warning",
        showCancelButton: true,
        confirmButtonText: action === "accepted" ? "Aceptar" : "Rechazar",
        cancelButtonText: "Cancelar",
      });
      if (!confirm.isConfirmed) return;
      const result = await dispatch(respondLike(likeId, action));
      if (!result?.success) {
        throw new Error("No se pudo procesar la solicitud");
      }
      if (action === "accepted") {
        await Swal.fire(
          "¡Canje aceptado!",
          "Se creó un chat para coordinar",
          "success",
        );
        showSafetyModal();
      } else {
        await Swal.fire("Canje rechazado", "", "info");
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo procesar la solicitud", "error");
    }
  };
  if (loading) {
    return <p className={style.state}> Cargando solicitudes... </p>;
  }
  if (!exchangeRequests?.length) {
    return <p className={style.state}> No hay solicitudes </p>;
  }
  return (
    <section className={style.container}>
      {" "}
      {exchangeRequests.map((req) => {
        const myPost = req.myPost;
        const anotherPost = req.anotherPost;
        if (!myPost || !anotherPost) {
          return null;
        }
        return (
          <motion.article
            key={req.id}
            className={style.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {" "}
            {/* PRODUCTOS */}{" "}
            <div className={style.like}>
              {" "}
              <div className={style.product}>
                {" "}
                <img
                  src={myPost.image?.[0] || "/placeholder.png"}
                  alt={myPost.title || "Producto ofrecido"}
                  loading="lazy"
                />{" "}
                <span className={style.productLabel}> Ofrecés </span>{" "}
                <h4> {myPost.title || "Sin título"} </h4>{" "}
              </div>{" "}
              {/* INTERCAMBIO */}{" "}
              <div className={style.exchange} aria-hidden="true">
                {" "}
                <span>⇄</span>{" "}
              </div>{" "}
              <div className={style.product}>
                {" "}
                <img
                  src={anotherPost.image?.[0] || "/placeholder.png"}
                  alt={anotherPost.title || "Producto recibido"}
                  loading="lazy"
                />{" "}
                <span className={style.productLabel}> Recibís </span>{" "}
                <h4> {anotherPost.title || "Sin título"} </h4>{" "}
              </div>{" "}
            </div>{" "}
            {/* ACCIONES */}{" "}
            <div className={style.actions}>
              {" "}
              <button
                type="button"
                className={style.acceptButton}
                onClick={() => handleRespond(req.id, "accepted", req)}
              >
                {" "}
                <span>✓</span> Aceptar{" "}
              </button>{" "}
              <button
                type="button"
                className={style.rejectButton}
                onClick={() => handleRespond(req.id, "rejected", req)}
              >
                {" "}
                <span>✕</span> Rechazar{" "}
              </button>{" "}
            </div>{" "}
          </motion.article>
        );
      })}{" "}
    </section>
  );
};
export default RecivedLikes;
