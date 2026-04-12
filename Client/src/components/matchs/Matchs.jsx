import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
        const myPost = match.myPost;

        const anotherPost = match.anotherPost;

        // 🔒 Seguridad: evitar render roto
        if (!myPost || !anotherPost) return null;

        return (
          <div key={match.id} className={style.matchCard}>
            {/* 🔄 CONTENIDO PRINCIPAL */}
            <div className={style.exchangeRow}>
              {/* 🟦 TU PRODUCTO */}
              <div className={style.product}>
                <p className={style.label}>Ofrecés</p>

                <Link to={`/detail/${myPost.id}`}>
                  <img
                    className={style.img}
                    src={myPost.image?.[0] || "/placeholder.png"}
                    alt={myPost.title}
                  />
                </Link>
                <h4 className={style.title}>{myPost.title}</h4>
              </div>

              {/* 🔁 FLECHA */}
              <div className={style.center}>
                <span className={style.arrow}>⇄</span>
              </div>

              {/* 🟩 OTRO PRODUCTO */}
              <div className={style.product}>
                <p className={style.label}>Recibís</p>

                <Link to={`/detail/${anotherPost.id}`}>
                  <img
                    className={style.img}
                    src={anotherPost.image?.[0] || "/placeholder.png"}
                    alt={anotherPost.title}
                  />
                </Link>

                <h4 className={style.title}>{anotherPost.title}</h4>
              </div>
            </div>

            {/* 🎯 BOTONES ABAJO */}
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
                <img
                  className={style.profileImg}
                  src={anotherPost.owner?.image || "/placeholder.png"}
                  alt="Avatar"
                />
                <span className={style.profileBtnName}>
                  {anotherPost.owner?.username || "Usuario"}
                </span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Matchs;
