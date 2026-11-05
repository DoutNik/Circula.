import { Link } from "react-router-dom";
import style from "./Card.module.css";
export default function Card({ post }) {
  const src = Array.isArray(post.image) ? post.image[0] : post.image;
  const title = post.title || "Producto sin título";
  return <Link to={`/detail/${post.id}`} className={style.link} aria-label={title}>
    <article className={style.card}>
      <div className={style.photo}>{src ? <img loading="lazy" src={src} alt="" /> : <span>Sin foto</span>}</div>
      <div className={style.content}>
        {post.category && <p className={style.category}>{post.category}</p>}
        <h3>{title}</h3>
        <p className={style.location}><svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M13 6.5c0 3.3-5 8-5 8s-5-4.7-5-8a5 5 0 1 1 10 0Z"/><circle cx="8" cy="6.5" r="1.6"/></svg>{post.ubication || "Sin ubicación"}</p>
      </div>
    </article>
  </Link>;
}
