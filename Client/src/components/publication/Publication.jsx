import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts, deletePost } from "../../redux/actions";
import style from "./Publication.module.css";

const Publication = ({ userData, onPostDeleted }) => {
  const dispatch = useDispatch();
  const allPosts = useSelector((state) => state.allPostsCopy);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);
 
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  
  const userPosts = allPosts.filter((post) => post.UserId === userData?.id);
  
  const handlePostDelete = async (postId) => {
    try {
      await dispatch(deletePost(postId));
      await dispatch(getAllPosts());
      await onPostDeleted?.();
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error al eliminar la publicación", error);
    }
  };

  return (
    <div className={style.publications}>
      {" "}
      {userPosts.map((post) => (
        <article key={post.id} className={style.publication}>
          {" "}
          {/* IMAGEN */}{" "}
          <div className={style.imageContainer}>
            {" "}
            <img
              src={post.image?.[0] || "/placeholder.png"}
              className={style.img}
              alt={post.title || "Publicación"}
              loading="lazy"
            />{" "}
          </div>{" "}
          {/* INFORMACIÓN */}{" "}
          <div className={style.info}>
            {" "}
            <h3 className={style.title}> {post.title || "Sin título"} </h3>{" "}
            <div className={style.meta}>
              {" "}
              <span aria-hidden="true">❤️</span> {post.likesCount || 0}{" "}
              interesados{" "}
            </div>{" "}
          </div>{" "}
          {/* ACCIONES */}{" "}
          <div
            className={style.actions}
            onClick={(event) => event.stopPropagation()}
          >
            {" "}
            <button
              type="button"
              className={style.menuBtn}
              onClick={() =>
                setOpenMenuId(openMenuId === post.id ? null : post.id)
              }
              aria-label="Opciones de publicación"
              aria-expanded={openMenuId === post.id}
            >
              {" "}
              ⋮{" "}
            </button>{" "}
            {openMenuId === post.id && (
              <div className={style.menu}>
                {" "}
                <button type="button" className={style.menuItem}>
                  {" "}
                  ✏️ <span>Editar</span>{" "}
                </button>{" "}
                <button type="button" className={style.menuItem}>
                  {" "}
                  ⏸️ <span>Pausar</span>{" "}
                </button>{" "}
                <button
                  type="button"
                  className={`${style.menuItem} ${style.menuItemDanger}`}
                  onClick={() => handlePostDelete(post.id)}
                >
                  {" "}
                  🗑️ <span>Eliminar</span>{" "}
                </button>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </article>
      ))}{" "}
    </div>
  );
};
export default Publication;
