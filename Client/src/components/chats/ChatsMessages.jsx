import io from "socket.io-client";
import api from "../../api/api";

import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createMessage, getMyChats } from "../../redux/actions";

import style from "./ChatsMessages.module.css";
import { errorMessage, focusFirstError } from "../../utils/formValidation.js";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

const ChatsMessages = ({ chatId, userData }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const composer = useRef(null);
  const requestInFlight = useRef(false);
  const currentChatId = useRef(chatId);
  const senderId = Number(userData?.id);

  const chats = useSelector((state) => state.chats);
  const activeChat = chats.find((chat) => Number(chat.id) === Number(chatId));
  const otherUsername = activeChat?.otherUser?.username || "";
  const otherUserImage = activeChat?.otherUser?.image || "";

  const [newMessage, setNewMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);
  const [messageError, setMessageError] = useState("");
  const [sending, setSending] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [historyAttempt, setHistoryAttempt] = useState(0);

  //Traer historial de mensajes de la base de datos y cargarla en el estado local
  useEffect(() => {
    let cancelled = false;
    currentChatId.current = chatId;
    setMessageHistory([]);
    setHistoryError("");
    setHistoryLoading(true);
    const fetchMessageHistory = async () => {
      try {
        const response = await api.get(`/messages/${chatId}`);
        if (!cancelled) setMessageHistory(response.data);
      } catch (error) {
        if (!cancelled) setHistoryError(errorMessage(error, "No pudimos cargar los mensajes. Volvé a intentar."));
      } finally { if (!cancelled) setHistoryLoading(false); }
    };
    fetchMessageHistory();
    return () => { cancelled = true; };
  }, [chatId, historyAttempt]);

useEffect(() => {
  const list = messagesEndRef.current;

  if (!list) return;

  list.scrollTo({
    top: list.scrollHeight,
    behavior: "smooth",
  });
}, [messageHistory]);

  const handleInputChange = (event) => {
    setNewMessage(event.target.value);
    if (messageError) setMessageError(event.target.value.trim() ? "" : "Escribí un mensaje antes de enviarlo.");
  };

  //Mandar info al servidor y guardar mensaje en base de datos
  const sendMessage = async (event) => {
    event?.preventDefault();
    if (requestInFlight.current) return;
    const content = newMessage.trim();
    if (!content || content.length > 2000) {
      const validation = !content ? "Escribí un mensaje antes de enviarlo." : "Tu mensaje puede tener hasta 2000 caracteres.";
      setMessageError(validation);
      focusFirstError(composer.current, { message: validation });
      return;
    }
    requestInFlight.current = true;
    setSending(true);
    setMessageError("");
    try {
      const message = await dispatch(createMessage(chatId, content));
      if (currentChatId.current === chatId) {
        // The response confirms delivery even if the socket is reconnecting.
        setMessageHistory((history) => history.some((item) => Number(item.id) === Number(message.id)) ? history : [...history, message]);
        setNewMessage("");
      }
    } catch (error) {
      if (currentChatId.current === chatId) {
        setMessageError(errorMessage(error, "No pudimos enviar el mensaje. El texto sigue acá para que puedas reintentarlo."));
        focusFirstError(composer.current, { message: true });
      }
    } finally { requestInFlight.current = false; setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Conexión del socket: una sola vez por chat, autenticada con el JWT
  // (el servidor ahora exige el token para dejar unirse a la sala del chat).
  useEffect(() => {
    const token = localStorage.getItem("token");

    const socketServer = io(SOCKET_URL, {
      auth: { token },
    });
    socketRef.current = socketServer;

    socketServer.emit("joinRoom", chatId);

    socketServer.on("chat message", (messageData) => {
      const receivedChatId = Number(messageData.chatId);

      if (receivedChatId !== Number(chatId)) {
        return;
      }

      setMessageHistory((prevMessages) => {
        // Evitar duplicados
        if (
          messageData.id &&
          prevMessages.some((msg) => Number(msg.id) === Number(messageData.id))
        ) {
          return prevMessages;
        }

        return [...prevMessages, messageData];
      });
    });

    return () => {
      socketServer.off("chat message");
      socketServer.disconnect();
    };
  }, [chatId]);

  // El endpoint de chats ya incluye únicamente el interlocutor permitido.
  // No se consulta el listado global de usuarios, que es exclusivo de admins.
  useEffect(() => {
    dispatch(getMyChats());
  }, [dispatch]);

  useEffect(() => {
    if (activeChat) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [activeChat]);

  return (
    <div className={style.chat}>
      <div className={style.user}>
        <img
          src={
            otherUserImage ||
            "https://img.icons8.com/fluency-systems-regular/96/user.png"
          }
          className={style.avatar}
          alt={`Foto de ${otherUsername || "usuario"}`}
        />
        <h3>{otherUsername}</h3>
      </div>

      <ul className={style.listMsg} ref={messagesEndRef}>
        {historyLoading && <li className={style.historyStatus} role="status">Cargando mensajes…</li>}
        {historyError && <li className={style.historyStatus}><p role="alert">{historyError}</p><button type="button" onClick={() => setHistoryAttempt((attempt) => attempt + 1)}>Volver a cargar</button></li>}
        {!historyLoading && !historyError && !messageHistory.length && <li className={style.historyStatus}>Todavía no hay mensajes. ¡Saludá para empezar el canje!</li>}
        {messageHistory.map((msg, index) => {
  const isMine = Number(msg.userId) === Number(senderId);

  const previousMessage = messageHistory[index - 1];

  const previousIsMine =
    previousMessage &&
    Number(previousMessage.userId) === Number(senderId);

  const isFirstInGroup =
    !previousMessage || isMine !== previousIsMine;

  return (
    <li key={msg.id || index}>
      <div className={style.messageWreapper}>
        {isFirstInGroup && (
          <div
            className={
              isMine
                ? style.myUserLabel
                : style.otherUserLabel
            }
          >
            <p>{isMine ? "Yo" : otherUsername}</p>
          </div>
        )}

        <div
          className={
            isMine
              ? style.myMessage
              : style.otherMessage
          }
        >
          <h5>{msg.content}</h5>
        </div>
      </div>
    </li>
  );
})}
      </ul>

      <form ref={composer} className={style.input} onSubmit={sendMessage} noValidate aria-busy={sending}>
        <label htmlFor="chat-message" className={style.composerLabel}>Tu mensaje</label>
        <div className={style.composerRow}>
        <textarea
          id="chat-message"
          name="message"
          rows={2}
          maxLength={2000}
          value={newMessage}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          placeholder="Por ejemplo: ¡Hola! ¿Cuándo te viene bien hacer el canje?"
          disabled={sending}
          aria-invalid={Boolean(messageError)}
          aria-describedby={`chat-message-hint${messageError ? " chat-message-error" : ""}`}
        />
        <button type="submit" className={style.sendMessage} disabled={sending} aria-label={sending ? "Enviando mensaje" : "Enviar mensaje"}>
          {sending ? <span className={style.sendProgress} aria-hidden="true">…</span> :
          <img
            width="24"
            height="24"
            src="https://img.icons8.com/fluency-systems-regular/48/sent--v1.png"
            alt=""
          />}
        </button>
        </div>
        <div className={style.composerHelp} id="chat-message-hint"><span>Enter para enviar · Shift + Enter para otra línea</span><span>{newMessage.length}/2000</span></div>
        {messageError && <p className={style.composerError} id="chat-message-error" role="alert">{messageError}</p>}
      </form>
    </div>
  );
};

export default ChatsMessages;
