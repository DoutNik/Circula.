import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import style from "./UserProfile.module.css";
import api from "../../api/api";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isUpdatingBlock, setIsUpdatingBlock] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileResponse, blocksResponse] = await Promise.all([
          api.get("/users/anotherUserId", { params: { id: userId } }),
          api.get("/blocks"),
        ]);
        setUserData(profileResponse.data);
        setIsBlocked(blocksResponse.data.some((block) => Number(block.blockedUserId) === Number(userId)));
      } catch (error) {
        console.error("Error al obtener el perfil:", error);
      }
    };
    loadProfile();
  }, [userId]);

  const handleBlockToggle = async () => {
    if (isUpdatingBlock) return;
    setIsUpdatingBlock(true);
    try {
      if (isBlocked) await api.delete(`/blocks/${userId}`);
      else await api.post(`/blocks/${userId}`);
      setIsBlocked((current) => !current);
    } catch (error) {
      window.alert(error.response?.data?.error || "No se pudo actualizar el bloqueo.");
    } finally {
      setIsUpdatingBlock(false);
    }
  };

  const handleReport = async () => {
    const reason = window.prompt("Contanos brevemente por qué querés denunciar este perfil:");
    if (!reason?.trim()) return;
    try {
      await api.post("/reports", { targetUserId: Number(userId), reason: reason.trim() });
      window.alert("Gracias. Tu denuncia fue enviada a moderación.");
    } catch (error) {
      window.alert(error.response?.data?.error || "No se pudo enviar la denuncia.");
    }
  };

  if (!userData) return <main className={style.loading}><p>Cargando perfil...</p></main>;

  const averageRating = Number(userData.averageRating) || 0;
  const roundedRating = Math.round(averageRating);

  return (
    <main className={style.container}>
      <section className={style.avatar}>
        <div className={style.profileTop}>
          <div className={style.photoWrapper}>
            <img src={userData.image} className={style.photo} alt={`Avatar de ${userData.username}`} />
          </div>
          <h2>{userData.username}</h2>
        </div>
        {averageRating > 0 ? (
          <div className={style.rating}>
            <div className={style.stars} aria-label={`Calificación ${averageRating} de 5`}>
              {Array.from({ length: roundedRating }, (_, index) => <span key={index}>⭐</span>)}
            </div>
            <span className={style.ratingValue}>{averageRating.toFixed(1)}</span>
          </div>
        ) : <p className={style.calif}>Todavía no hay calificaciones.</p>}
        <div className={style.actions}>
          <button type="button" className={style.back} onClick={() => navigate(-1)}>Atrás</button>
          <Link to={`/review/${userId}`} className={style.bRating}>Escribir reseña</Link>
          <button type="button" onClick={handleBlockToggle} className={style.bRating} disabled={isUpdatingBlock}>
            {isBlocked ? "Desbloquear" : "Bloquear"}
          </button>
          <button type="button" onClick={handleReport} className={style.bRating}>Denunciar</button>
        </div>
      </section>
    </main>
  );
};

export default UserProfile;
