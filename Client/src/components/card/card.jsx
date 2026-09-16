import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import style from "./Card.module.css";

const DEFAULT_IMAGE =
  "https://img.icons8.com/fluency-systems-regular/240/image.png";

const Card = ({ post }) => {
  const { id, ubication, title, image } = post;

  const imageUrl = Array.isArray(image) ? image[0] : image;

  return (
    <Link to={`/detail/${id}`} className={style.link}>
      <motion.article
        className={style.card}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
          src={imageUrl || DEFAULT_IMAGE}
          className={style.img}
          alt={title || "Publicación"}
        />

        <div className={style.content}>
          <p className={style.location}>📍 {ubication || "Sin ubicación"}</p>
          <h3 className={style.title}>{title || "Sin título"}</h3>
        </div>
      </motion.article>
    </Link>
  );
};

export default Card;