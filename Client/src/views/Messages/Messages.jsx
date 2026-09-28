import { useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getMyChats } from "../../redux/actions";
import { useNavigate } from "react-router-dom";

import style from "./Messages.module.css";

const Messages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const chats = useSelector((state) => state.chats);

  useEffect(() => {
    dispatch(getMyChats());
  }, [dispatch]);

  const handleClick = (chatId) => {
    navigate(`/chats/${chatId}`);
  };

  return (
    <main className={style.messages}>
      <h2>Conversaciones</h2>

      {chats.length === 0 ? (
        <p className={style.empty}>
          No tienes conversaciones todavía.
        </p>
      ) : (
        <div className={style.chatList}>
          {chats.map((chat) => (
            <motion.button
              key={chat.id}
              type="button"
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.25,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => handleClick(chat.id)}
              className={style.list}
            >
              <img
                src={chat.otherUser?.image}
                alt={
                  chat.otherUser?.username
                    ? `Foto de ${chat.otherUser.username}`
                    : "Foto de usuario"
                }
              />

              <div className={style.userInfo}>
                <h4>
                  {chat.otherUser?.username || "Usuario"}
                </h4>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </main>
  );
};

export default Messages;