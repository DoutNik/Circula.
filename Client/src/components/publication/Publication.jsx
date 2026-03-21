import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts, deletePost, deleteMatch } from "../../redux/actions";

import style from "./Publication.module.css";

const Publication = ({ userData, isPremium }) => {
  const dispatch = useDispatch();

  const allPosts = useSelector((state) => state.allPostsCopy);
  const matches = useSelector((state) => state.matches);

  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // 🎯 Posts del usuario
  const userPosts = allPosts.filter((post) => post.UserId === userData?.id);

  const handlePostDelete = async (postId) => {
    try {
      await dispatch(deletePost(postId));
      await dispatch(getAllPosts());

      // 🔥 eliminar matches relacionados
      const matchesToDelete = matches.filter((match) =>
        match.match.some(
          (m) => m.myPostId == postId || m.likedPostId == postId,
        ),
      );

      matchesToDelete.forEach((match) => {
        match.match.forEach((m) => {
          if (m.myPostId === postId || m.likedPostId === postId) {
            dispatch(deleteMatch(match.id, m.id));
          }
        });
      });
    } catch (error) {
      console.error("Error al eliminar la publicación", error);
    }
  };

  return (
    <>
      {userPosts.map((post) => (
        <div key={post.id} className={style.publication}>
          {/* 🖼️ Imagen */}
          <img src={post.image?.[0]} className={style.img} alt={post.title} />

          {/* 📄 Info */}
          <div className={style.info}>
            <h3 className={style.title}>{post.title}</h3>

            <div className={style.meta}>
              ❤️ {post.likesCount || 0} interesados
            </div>

            {!isPremium && (post.likesCount || 0) > 0 && (
              <span className={style.premiumHint}>
                🔒 Ver quiénes — Premium
              </span>
            )}
          </div>

          {/* ⚙️ Opciones */}
          <div className={style.actions}>
            <button
              className={style.menuBtn}
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === post.id ? null : post.id);
              }}
            >
              ⋮
            </button>

            {openMenuId === post.id && (
              <div className={style.menu}>
                <button className={style.menuItem}>✏️ Editar</button>

                <button className={style.menuItem}>⏸️ Pausar</button>

                <button
                  className={style.menuItem}
                  onClick={() => {
                    handlePostDelete(post.id);
                    setOpenMenuId(null);
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export default Publication;
