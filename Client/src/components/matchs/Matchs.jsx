import { useCallback, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getMatches, createChat } from "../../redux/actions";
import style from "./Matchs.module.css";

const Matchs = ({ userData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const matches = useSelector((state) => state.matches);
  const chats = useSelector((state) => state.chats);
  const loading = useSelector((state) => state.loadingMatches);

  const creatingChatsRef = useRef(new Set());

  const userId = userData?.id;

  useEffect(() => {
    if (!userId) return;

    // Idealmente el backend obtiene el usuario autenticado
    // directamente desde el JWT.
    dispatch(getMatches(userId));
  }, [dispatch, userId]);

  const normalizeId = useCallback((id) => String(id), []);

  const findChat = useCallback(
    (anotherUserId) => {
      if (!Array.isArray(chats) || !userId || !anotherUserId) {
        return null;
      }

      const currentUserId = normalizeId(userId);
      const otherUserId = normalizeId(anotherUserId);

      return (
        chats.find((chat) => {
          const chatUser1 = normalizeId(chat.user1Id);
          const chatUser2 = normalizeId(chat.user2Id);

          return (
            (chatUser1 === currentUserId && chatUser2 === otherUserId) ||
            (chatUser1 === otherUserId && chatUser2 === currentUserId)
          );
        }) || null
      );
    },
    [chats, normalizeId, userId],
  );

  const handleGoChat = async (anotherUserId) => {
    if (!userId || !anotherUserId) {
      return;
    }

    const existingChat = findChat(anotherUserId);

    if (existingChat?.id) {
      navigate(`/chats/${existingChat.id}`);
      return;
    }

    const normalizedOtherUserId = normalizeId(anotherUserId);

    // Evita dos requests simultáneos si el usuario hace doble click.
    if (creatingChatsRef.current.has(normalizedOtherUserId)) {
      return;
    }

    creatingChatsRef.current.add(normalizedOtherUserId);

    try {
      /*
       * IMPORTANTE:
       * El backend ya no recibe userId.
       * El usuario autenticado sale del JWT.
       */
      const result = await dispatch(createChat(anotherUserId));

      /*
       * Adaptamos varias formas habituales de respuesta Redux.
       * El backend devuelve:
       *
       * { chatId: response.id }
       */
      const chatId =
        result?.payload?.chatId ??
        result?.chatId ??
        result?.data?.chatId;

      if (chatId) {
        navigate(`/chats/${chatId}`);
        return;
      }

      /*
       * Si la acción Redux no devuelve el chatId,
       * no debemos intentar adivinarlo desde el estado,
       * porque "chats" puede todavía estar desactualizado.
       */
      console.error(
        "No se recibió chatId al crear el chat.",
        result,
      );
    } catch (error) {
      console.error("Error al crear o abrir el chat:", error);
    } finally {
      creatingChatsRef.current.delete(normalizedOtherUserId);
    }
  };

  const handleGoProfile = (anotherUserId) => {
    if (!anotherUserId) return;

    navigate(`/UserProfile/${anotherUserId}`);
  };

  if (!userId) {
    return (
      <p className={style.statusMessage}>
        Cargando usuario...
      </p>
    );
  }

  if (loading) {
    return (
      <p className={style.statusMessage}>
        Cargando matches...
      </p>
    );
  }

  if (!Array.isArray(matches) || matches.length === 0) {
    return (
      <p className={style.statusMessage}>
        No tenés matches todavía
      </p>
    );
  }

  return (
    <section className={style.container}>
      {matches.map((match) => {
        const myPost = match?.myPost;
        const anotherPost = match?.anotherPost;

        if (!myPost || !anotherPost) {
          return null;
        }

        const anotherUserId = anotherPost.UserId;

        return (
          <article
            key={match.id}
            className={style.matchCard}
          >
            <div className={style.exchangeRow}>
              {/* TU PRODUCTO */}
              <div className={style.product}>
                <span className={style.label}>
                  Ofrecés
                </span>

                <Link
                  to={`/detail/${myPost.id}`}
                  className={style.imageLink}
                >
                  <img
                    className={style.img}
                    src={myPost.image?.[0] || "/placeholder.png"}
                    alt={
                      myPost.title ||
                      "Producto ofrecido"
                    }
                    loading="lazy"
                    decoding="async"
                  />
                </Link>

                <h4 className={style.title}>
                  {myPost.title || "Sin título"}
                </h4>
              </div>

              {/* FLECHA */}
              <div
                className={style.center}
                aria-hidden="true"
              >
                <span className={style.arrow}>⇄</span>
              </div>

              {/* PRODUCTO DEL OTRO USUARIO */}
              <div className={style.product}>
                <span className={style.label}>
                  Recibís
                </span>

                <Link
                  to={`/detail/${anotherPost.id}`}
                  className={style.imageLink}
                >
                  <img
                    className={style.img}
                    src={
                      anotherPost.image?.[0] ||
                      "/placeholder.png"
                    }
                    alt={
                      anotherPost.title ||
                      "Producto recibido"
                    }
                    loading="lazy"
                    decoding="async"
                  />
                </Link>

                <h4 className={style.title}>
                  {anotherPost.title || "Sin título"}
                </h4>
              </div>
            </div>

            {/* ACCIONES */}
            <div className={style.actions}>
              <button
                type="button"
                className={style.chatBtn}
                onClick={() =>
                  handleGoChat(anotherUserId)
                }
                disabled={!anotherUserId}
              >
                <span
                  className={style.buttonIcon}
                  aria-hidden="true"
                >
                  💬
                </span>

                <span>Chat</span>
              </button>

              <button
                type="button"
                className={style.profileBtn}
                onClick={() =>
                  handleGoProfile(anotherUserId)
                }
                disabled={!anotherUserId}
              >
                <img
                  className={style.profileImg}
                  src={
                    anotherPost.owner?.image ||
                    "/placeholder.png"
                  }
                  alt=""
                  loading="lazy"
                  decoding="async"
                />

                <span className={style.profileBtnName}>
                  {anotherPost.owner?.username ||
                    "Usuario"}
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
