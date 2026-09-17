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

  // Crear chat automáticamente si no existe
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
    return <p className={style.statusMessage}>Cargando matches...</p>;
  }

  if (!matches.length) {
    return <p className={style.statusMessage}>No tenés matches todavía</p>;
  }

  return (
    <section className={style.container}>
      {matches.map((match) => {
        const myPost = match.myPost;
        const anotherPost = match.anotherPost;

        // Evitar render roto si falta información
        if (!myPost || !anotherPost) return null;

        return (
          <article key={match.id} className={style.matchCard}>
            {/* PRODUCTOS */}
            <div className={style.exchangeRow}>
              {/* TU PRODUCTO */}
              <div className={style.product}>
                <span className={style.label}>Ofrecés</span>

                <Link to={`/detail/${myPost.id}`} className={style.imageLink}>
                  <img
                    className={style.img}
                    src={myPost.image?.[0] || "/placeholder.png"}
                    alt={myPost.title || "Producto ofrecido"}
                    loading="lazy"
                  />
                </Link>

                <h4 className={style.title}>{myPost.title}</h4>
              </div>

              {/* FLECHA */}
              <div className={style.center} aria-hidden="true">
                <span className={style.arrow}>⇄</span>
              </div>

              {/* OTRO PRODUCTO */}
              <div className={style.product}>
                <span className={style.label}>Recibís</span>

                <Link
                  to={`/detail/${anotherPost.id}`}
                  className={style.imageLink}
                >
                  <img
                    className={style.img}
                    src={anotherPost.image?.[0] || "/placeholder.png"}
                    alt={anotherPost.title || "Producto recibido"}
                    loading="lazy"
                  />
                </Link>

                <h4 className={style.title}>{anotherPost.title}</h4>
              </div>
            </div>

            {/* ACCIONES */}
            <div className={style.actions}>
              <button
                type="button"
                className={style.chatBtn}
                onClick={() => handleGoChat(anotherPost.UserId)}
              >
                <span className={style.buttonIcon}>💬</span>
                <span>Chat</span>
              </button>

              <button
                type="button"
                className={style.profileBtn}
                onClick={() => handleGoProfile(anotherPost.UserId)}
              >
                <img
                  className={style.profileImg}
                  src={anotherPost.owner?.image || "/placeholder.png"}
                  alt=""
                  loading="lazy"
                />

                <span className={style.profileBtnName}>
                  {anotherPost.owner?.username || "Usuario"}
                </span>
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default Matchs;
