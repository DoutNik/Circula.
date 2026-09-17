import React from "react";
import { motion } from "framer-motion";
import style from "./PayModal.module.css";
import api from "../../api/api";
const PayModal = ({ userData, user, isOpen, onClose }) => {
  const handlePremium = async () => {
    try {
      const currentUser = userData || user;
      if (!currentUser?.id) {
        console.error("No se encontró el ID del usuario");
        return;
      }
      const paymentData = {
        userId: currentUser.id,
        title: "Premium",
        quantity: 1,
        currency_id: "ARS",
        description: "Usuario premium",
      };
      const response = await api.post("/plans/create-order", paymentData);
      if (response?.data?.init_point) {
        window.location.href = response.data.init_point;
      } else {
        console.error("No se encontró init_point en la respuesta");
      }
    } catch (error) {
      console.error("Error al realizar solicitud de compra:", error);
    }
  };
  if (!isOpen) return null;
  return (
    <motion.div
      className={style.modaloverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      {" "}
      <motion.div
        className={style.modalcontent}
        initial={{ opacity: 0, scale: 0.75, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-title"
      >
        {" "}
        {/* CERRAR */}{" "}
        <button
          type="button"
          onClick={onClose}
          className={style.close}
          aria-label="Cerrar"
        >
          {" "}
          ✖️{" "}
        </button>{" "}
        {/* CONTENIDO */}{" "}
        <div className={style.modalbody}>
          {" "}
          <h2 id="premium-title"> ¡Sé Premium! </h2>{" "}
          <p> 💛 ¡Publicá todos los artículos que quieras! 💛 </p>{" "}
          <p> 👀 Mirá quién quiere canjear con vos 👀 </p>{" "}
          <button type="button" className={style.pay} onClick={handlePremium}>
            {" "}
            Sé Premium{" "}
          </button>{" "}
          <h6> Un pago de $2000 ARS </h6>{" "}
        </div>{" "}
      </motion.div>{" "}
    </motion.div>
  );
};
export default PayModal;
