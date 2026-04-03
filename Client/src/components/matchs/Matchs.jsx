import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMatches, createChat, getAllChats } from "../../redux/actions";

import style from "./Matchs.module.css";

const Matchs = ({ userData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userId = userData.id;

  const matches = useSelector((state) => state.matches);
  const chats = useSelector((state) => state.chats);
  const loading = useSelector((state) => state.loadingMatches);

  useEffect(() => {
    dispatch(getMatches(userId));
    dispatch(getAllChats());
  }, [dispatch, userId]);

  // ✅ Crear chat automáticamente si no existe
  const ensureChatExists = async (anotherUserId) => {
    const existingChat = chats.find(
      (chat) =>
        (chat.user1Id === userId && chat.user2Id === anotherUserId) ||
        (chat.user1Id === anotherUserId && chat.user2Id === userId),
    );

    if (!existingChat) {
      await dispatch(createChat(userId, anotherUserId));
    }
  };

  const handleGoChat = async (anotherUserId) => {
    await ensureChatExists(anotherUserId);

    const chat = chats.find(
      (chat) =>
        (chat.user1Id === userId && chat.user2Id === anotherUserId) ||
        (chat.user1Id === anotherUserId && chat.user2Id === userId),
    );

    if (chat) {
      navigate(`/chats/${chat.id}`);
    }
  };

  const handleGoProfile = (anotherUserId) => {
    navigate(`/UserProfile/${anotherUserId}`);
  };

  if (loading) {
    return <p>Cargando matches...</p>;
  }

  if (!matches.length) {
    return <p>No tenés matches todavía</p>;
  }

return (
  <div className={style.container}>
    {matches.map((match) => {
      const myPost = match.posts?.find(
        (post) => post.UserId === userId
      );

      const anotherPost = match.posts?.find(
        (post) => post.UserId !== userId
      );

      // 🔒 Seguridad: evitar render roto
      if (!myPost || !anotherPost) return null;

      return (
        <div key={match.id} className={style.matchCard}>
          
          {/* 🖼️ Productos */}
          <div className={style.products}>
            <img
              className={style.img}
              src={myPost.image?.[0] || "/placeholder.png"}
              alt={myPost.title}
            />

            <span className={style.arrow}>⇄</span>

            <img
              className={style.img}
              src={anotherPost.image?.[0] || "/placeholder.png"}
              alt={anotherPost.title}
            />
          </div>

          {/* 🧠 Info clara */}
          <div className={style.info}>
            <div className={style.block}>
              <p className={style.label}>Tu producto</p>
              <h4 className={style.title}>{myPost.title}</h4>
            </div>

            <span className={style.arrow}>⇄</span>

            <div className={style.block}>
              <p className={style.label}>Recibís</p>
              <h4 className={style.title}>{anotherPost.title}</h4>
            </div>
          </div>

          {/* 🎯 Acciones */}
          <div className={style.actions}>
            <button
              className={style.chatBtn}
              onClick={() => handleGoChat(anotherPost.UserId)}
            >
              💬 Chat
            </button>

            <button
              className={style.profileBtn}
              onClick={() => handleGoProfile(anotherPost.UserId)}
            >
              👤 Ver perfil
            </button>
          </div>
        </div>
      );
    })}
  </div>
);
};

export default Matchs;
