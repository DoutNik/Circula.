import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import style from "./Modal.module.css";
const Modal = () => {
  const [modal, setModal] = useState(true);
  const toggleModal = () => {
    setModal((prev) => !prev);
  };
  useEffect(() => {
    if (modal) {
      document.body.classList.add("activeModal");
    } else {
      document.body.classList.remove("activeModal");
    }
    return () => {
      document.body.classList.remove("activeModal");
    };
  }, [modal]);
  if (!modal) return null;
  return (
    <motion.div
      className={style.modal}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {" "}
      {/* Overlay */}{" "}
      <motion.div
        className={style.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={toggleModal}
      />{" "}
      {/* Contenido */}{" "}
      <motion.div
        className={style.modalContent}
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {" "}
        <button
          type="button"
          className={style.closeModal}
          onClick={toggleModal}
          aria-label="Cerrar modal"
        >
          {" "}
          ✖️{" "}
        </button>{" "}
        <div className={style.modalBody}>
          {" "}
          <h2 id="modal-title">🎉 ¡Hecho! 🎉</h2>{" "}
          <p>
            {" "}
            Tu publicación ha sido creada correctamente. Puedes verla en tu
            perfil o visualizarla en el inicio.{" "}
          </p>{" "}
        </div>{" "}
      </motion.div>{" "}
    </motion.div>
  );
};
export default Modal;