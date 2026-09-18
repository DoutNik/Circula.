import React from "react";
import style from "./VideoModal.module.css";
const VideoModal = ({ onClose }) => {
  return (
    <div className={style.modalOverlay}>
      {" "}
      <div
        className={style.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Video"
      >
        {" "}
        {/* BOTÓN CERRAR */}{" "}
        <button
          type="button"
          className={style.closeButton}
          onClick={onClose}
          aria-label="Cerrar video"
        >
          {" "}
          ×{" "}
        </button>{" "}
        {/* VIDEO */}{" "}
        <div className={style.videoContainer}>
          {" "}
          <iframe
            src="https://www.youtube.com/embed/xgOYEsdFaO4?si=8XxPYS_ejzwfPbD_"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default VideoModal;
