import React from "react";
import { motion } from "framer-motion";
import style from "./PayModal.module.css";
import api from "../../api/api";

const payModal = ({ userData, user, isOpen, onClose }) => {

  const handlePremium = async () => {
    try {
      let paymentData;
  
      if (userData) {
        paymentData = {
          userId: userData.id,
          title: "Premium",
          quantity: 1,
          price: 1500,
          currency_id: "ARG",
          description: "Usuario premium",
        };
      } else {
        paymentData = {
          userId: user.id,
          title: "Premium",
          quantity: 1,
          price: 1500,
          currency_id: "ARG",
          description: "Usuario premium",
        };
      }
  
      const response = await api.post("/plans/create-order", paymentData);
  
      if (response) {
        window.location.href = response.data.response.body.init_point;
      } else {
        console.error("Init point not found in the response");
      }
    } catch (error) {
      console.error("Error al realizar solicitud de compra", error);
    }
  };

  return (
    isOpen && (
      <motion.div
         initial={{
          opacity: 0,
          scale: 0.7,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className={style.modaloverlay}
      >
        <div
          className={style.modalcontent}
        >
          <button onClick={onClose} className={style.close}>
            ✖️
          </button>

          <h2>¡Sé Premium!</h2>
          <p>💛 ¡Publicá todos los articulos que quieras! 💛</p>

          <p>👀 Mirá quien quiere canjear con vos 👀</p>

          <button className={style.pay} onClick={handlePremium}>Sé premium</button>
          <h6>Un pago de $1500 ARS</h6>
        </div>
      </motion.div>
    )
  );
};

export default payModal;
