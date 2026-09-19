import { useParams } from "react-router-dom";
import ChatsMessages from "../../components/chats/ChatsMessages";
import style from "./Chats.module.css";
const Chats = ({ userData }) => {
  const { chatId } = useParams();
  return (
    <main className={style.chats}>
      {" "}
      <section className={style.chatsMsg}>
        {" "}
        <ChatsMessages chatId={chatId} userData={userData} />{" "}
      </section>{" "}
    </main>
  );
};
export default Chats;
